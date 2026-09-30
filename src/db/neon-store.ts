import { randomUUID } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { classifyInquiry } from "@/lib/classify";
import { writeReply } from "@/lib/reply";
import type {
  AppNotification,
  Classification,
  ContactChannel,
  FleetBand,
  InquiryDetail,
  InquiryInput,
  InquiryKind,
  InquiryListItem,
  InquiryStatus,
  ProposalStatus,
  SolutionRelation,
  Urgency,
} from "@/lib/types";

type Sql = NeonQueryFunction<false, false>;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

export function usesNeon() {
  return Boolean(process.env.DATABASE_URL);
}

export async function createInquiry(input: InquiryInput) {
  const sql = requireSql();
  const classification = classifyInquiry(input);
  const reply = await writeReply(input, classification);
  const nowId = randomUUID();
  const proposalId = randomUUID();
  const inquiryId = randomUUID();

  const existing = await sql`SELECT id FROM clients WHERE phone = ${input.phone} LIMIT 1`;
  let clientId = existing[0]?.id as string | undefined;
  const clientIsNew = !clientId;
  if (!clientId) clientId = randomUUID();

  const queries = [
    clientIsNew
      ? sql`
          INSERT INTO clients (id, full_name, company, phone, email)
          VALUES (${clientId}, ${input.fullName}, ${input.company}, ${input.phone}, ${input.email})
        `
      : sql`
          UPDATE clients
          SET full_name = ${input.fullName},
              company = ${input.company},
              email = COALESCE(${input.email}, email)
          WHERE id = ${clientId}
        `,
    sql`
      INSERT INTO inquiries (id, client_id, kind, message, fleet_size, status)
      VALUES (${inquiryId}, ${clientId}, ${input.kind}, ${input.message}, ${input.fleetSize}, 'proposition_ia')
    `,
    sql`
      INSERT INTO inquiry_classifications
        (inquiry_id, sector_id, urgency, fleet_band, confidence, method)
      VALUES (
        ${inquiryId},
        ${classification.sectorId},
        ${classification.urgency},
        ${classification.fleetBand},
        ${classification.confidence},
        ${classification.method}
      )
    `,
    ...classification.solutions.map(
      (item) => sql`
        INSERT INTO inquiry_solutions (inquiry_id, solution_id, relation)
        VALUES (${inquiryId}, ${item.solutionId}, ${item.relation})
      `,
    ),
    ...classification.painIds.map(
      (painId) => sql`
        INSERT INTO inquiry_pains (inquiry_id, pain_id)
        VALUES (${inquiryId}, ${painId})
      `,
    ),
    sql`
      INSERT INTO ai_proposals (id, inquiry_id, body, status, model)
      VALUES (${proposalId}, ${inquiryId}, ${reply.body}, 'brouillon', ${reply.model})
    `,
    sql`
      INSERT INTO notifications (id, inquiry_id, title, body)
      VALUES (
        ${nowId},
        ${inquiryId},
        ${input.kind === "devis" ? "Nouvelle demande de devis" : "Nouvelle demande d'information"},
        ${`${input.fullName} · ${input.company}`}
      )
    `,
  ];

  await sql.transaction(queries);
  return { id: inquiryId, reply: reply.body, classification };
}

export async function listInquiries(): Promise<InquiryListItem[]> {
  const sql = requireSql();
  const rows = await sql`
    SELECT
      i.id, i.kind, i.status, i.created_at,
      c.full_name, c.company, c.phone,
      cl.sector_id, cl.urgency,
      EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.inquiry_id = i.id AND n.read_at IS NULL
      ) AS unread
    FROM inquiries i
    JOIN clients c ON c.id = i.client_id
    LEFT JOIN inquiry_classifications cl ON cl.inquiry_id = i.id
    ORDER BY i.created_at DESC
    LIMIT 100
  `;
  const ids = rows.map((row) => row.id as string);
  const links = ids.length
    ? await sql`
        SELECT inquiry_id, solution_id
        FROM inquiry_solutions
        WHERE inquiry_id = ANY(${ids}::uuid[])
      `
    : [];

  return rows.map((row) => ({
    id: row.id as string,
    kind: row.kind as InquiryKind,
    status: row.status as InquiryStatus,
    createdAt: new Date(row.created_at as string).toISOString(),
    fullName: row.full_name as string,
    company: row.company as string,
    phone: row.phone as string,
    sectorId: (row.sector_id as string | null) ?? null,
    urgency: (row.urgency as Urgency | null) ?? null,
    solutionIds: links
      .filter((link) => link.inquiry_id === row.id)
      .map((link) => link.solution_id as string),
    unread: Boolean(row.unread),
  }));
}

export async function unreadCount() {
  const sql = requireSql();
  const rows = await sql`SELECT count(*)::int AS total FROM notifications WHERE read_at IS NULL`;
  return Number(rows[0]?.total ?? 0);
}

export async function listNotifications(): Promise<AppNotification[]> {
  const sql = requireSql();
  const rows = await sql`
    SELECT id, inquiry_id, title, body, read_at, created_at
    FROM notifications
    ORDER BY created_at DESC
    LIMIT 20
  `;
  return rows.map((row) => ({
    id: row.id as string,
    inquiryId: row.inquiry_id as string,
    title: row.title as string,
    body: row.body as string,
    readAt: row.read_at ? new Date(row.read_at as string).toISOString() : null,
    createdAt: new Date(row.created_at as string).toISOString(),
  }));
}

export async function getInquiry(id: string): Promise<InquiryDetail | null> {
  const sql = requireSql();
  const rows = await sql`
    SELECT
      i.id, i.kind, i.status, i.message, i.fleet_size, i.created_at,
      c.full_name, c.company, c.phone, c.email,
      cl.sector_id, cl.urgency, cl.fleet_band, cl.confidence, cl.method
    FROM inquiries i
    JOIN clients c ON c.id = i.client_id
    LEFT JOIN inquiry_classifications cl ON cl.inquiry_id = i.id
    WHERE i.id = ${id}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;

  const solutionRows = await sql`
    SELECT solution_id, relation FROM inquiry_solutions WHERE inquiry_id = ${id}
  `;
  const painRows = await sql`SELECT pain_id FROM inquiry_pains WHERE inquiry_id = ${id}`;
  const proposalRows = await sql`
    SELECT id, body, status, model
    FROM ai_proposals
    WHERE inquiry_id = ${id}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const contactRows = await sql`
    SELECT id, channel, created_at
    FROM contact_logs
    WHERE inquiry_id = ${id}
    ORDER BY created_at DESC
  `;

  const classification: Classification | null = row.method
    ? {
        sectorId: (row.sector_id as string | null) ?? null,
        painIds: painRows.map((item) => item.pain_id as string),
        solutions: solutionRows.map((item) => ({
          solutionId: item.solution_id as string,
          relation: item.relation as SolutionRelation,
        })),
        urgency: row.urgency as Urgency,
        fleetBand: row.fleet_band as FleetBand,
        confidence: Number(row.confidence),
        method: "regles",
      }
    : null;
  const proposal = proposalRows[0];

  return {
    id: row.id as string,
    kind: row.kind as InquiryKind,
    status: row.status as InquiryStatus,
    message: row.message as string,
    fleetSize: row.fleet_size === null ? null : Number(row.fleet_size),
    createdAt: new Date(row.created_at as string).toISOString(),
    client: {
      fullName: row.full_name as string,
      company: row.company as string,
      phone: row.phone as string,
      email: (row.email as string | null) ?? null,
    },
    classification,
    proposal: proposal
      ? {
          id: proposal.id as string,
          body: proposal.body as string,
          status: proposal.status as ProposalStatus,
          model: proposal.model as string,
        }
      : null,
    contacts: contactRows.map((item) => ({
      id: item.id as string,
      channel: item.channel as ContactChannel,
      createdAt: new Date(item.created_at as string).toISOString(),
    })),
  };
}

export async function markRead(inquiryId: string) {
  const sql = requireSql();
  await sql`
    UPDATE notifications SET read_at = now()
    WHERE inquiry_id = ${inquiryId} AND read_at IS NULL
  `;
  await sql`
    UPDATE inquiries SET status = 'en_revue'
    WHERE id = ${inquiryId} AND status = 'proposition_ia'
  `;
}

export async function saveProposal(proposalId: string, body: string, status: ProposalStatus) {
  const sql = requireSql();
  await sql`
    UPDATE ai_proposals
    SET body = ${body}, status = ${status}, updated_at = now()
    WHERE id = ${proposalId}
  `;
}

export async function logContact(inquiryId: string, proposalId: string | null, channel: ContactChannel) {
  const sql = requireSql();
  await sql`
    INSERT INTO contact_logs (id, inquiry_id, proposal_id, channel)
    VALUES (${randomUUID()}, ${inquiryId}, ${proposalId}, ${channel})
  `;
  await sql`UPDATE inquiries SET status = 'contactee' WHERE id = ${inquiryId}`;
  if (proposalId && channel === "whatsapp") {
    await sql`UPDATE ai_proposals SET status = 'envoyee', updated_at = now() WHERE id = ${proposalId}`;
  }
}

export async function setStatus(inquiryId: string, status: InquiryStatus) {
  const sql = requireSql();
  await sql`UPDATE inquiries SET status = ${status} WHERE id = ${inquiryId}`;
}

function requireSql(): Sql {
  const sql = db();
  if (!sql) throw new Error("DATABASE_URL manquant");
  return sql;
}
