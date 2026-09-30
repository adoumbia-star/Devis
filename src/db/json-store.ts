import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { classifyInquiry } from "@/lib/classify";
import { writeReply } from "@/lib/reply";
import type {
  AppNotification,
  Classification,
  ContactChannel,
  InquiryDetail,
  InquiryInput,
  InquiryListItem,
  InquiryStatus,
  ProposalStatus,
} from "@/lib/types";

type Row = {
  clients: {
    id: string;
    fullName: string;
    company: string;
    phone: string;
    email: string | null;
    createdAt: string;
  }[];
  inquiries: {
    id: string;
    clientId: string;
    kind: InquiryInput["kind"];
    message: string;
    fleetSize: number | null;
    status: InquiryStatus;
    createdAt: string;
  }[];
  classifications: ({ inquiryId: string } & Classification)[];
  proposals: {
    id: string;
    inquiryId: string;
    body: string;
    status: ProposalStatus;
    model: string;
  }[];
  notifications: AppNotification[];
  contacts: { id: string; inquiryId: string; proposalId: string | null; channel: ContactChannel; createdAt: string }[];
};

const empty = (): Row => ({
  clients: [],
  inquiries: [],
  classifications: [],
  proposals: [],
  notifications: [],
  contacts: [],
});

const filePath = path.join(process.cwd(), ".data", "db.json");
let queue: Promise<unknown> = Promise.resolve();

function locked<T>(fn: () => Promise<T>) {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readDb(): Promise<Row> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as Row;
  } catch {
    return empty();
  }
}

async function writeDb(db: Row) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(db, null, 2));
}

function listFrom(db: Row): InquiryListItem[] {
  return [...db.inquiries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((inquiry) => {
      const client = db.clients.find((item) => item.id === inquiry.clientId);
      const classification = db.classifications.find((item) => item.inquiryId === inquiry.id);
      return {
        id: inquiry.id,
        kind: inquiry.kind,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        fullName: client?.fullName ?? "",
        company: client?.company ?? "",
        phone: client?.phone ?? "",
        sectorId: classification?.sectorId ?? null,
        urgency: classification?.urgency ?? null,
        solutionIds: classification?.solutions.map((item) => item.solutionId) ?? [],
        unread: db.notifications.some((item) => item.inquiryId === inquiry.id && !item.readAt),
      };
    });
}

function detailFrom(db: Row, id: string): InquiryDetail | null {
  const inquiry = db.inquiries.find((item) => item.id === id);
  if (!inquiry) return null;
  const client = db.clients.find((item) => item.id === inquiry.clientId);
  if (!client) return null;
  const classification = db.classifications.find((item) => item.inquiryId === id) ?? null;
  const proposal = db.proposals.find((item) => item.inquiryId === id) ?? null;
  return {
    id: inquiry.id,
    kind: inquiry.kind,
    status: inquiry.status,
    message: inquiry.message,
    fleetSize: inquiry.fleetSize,
    createdAt: inquiry.createdAt,
    client: {
      fullName: client.fullName,
      company: client.company,
      phone: client.phone,
      email: client.email,
    },
    classification: classification
      ? {
          sectorId: classification.sectorId,
          painIds: classification.painIds,
          solutions: classification.solutions,
          urgency: classification.urgency,
          fleetBand: classification.fleetBand,
          confidence: classification.confidence,
          method: classification.method,
        }
      : null,
    proposal: proposal
      ? { id: proposal.id, body: proposal.body, status: proposal.status, model: proposal.model }
      : null,
    contacts: db.contacts
      .filter((item) => item.inquiryId === id)
      .map((item) => ({ id: item.id, channel: item.channel, createdAt: item.createdAt })),
  };
}

export const jsonStore = {
  mode: "local" as const,

  async createInquiry(input: InquiryInput) {
    return locked(async () => {
      const db = await readDb();
      const now = new Date().toISOString();
      let client = db.clients.find((item) => item.phone === input.phone);
      if (client) {
        client.fullName = input.fullName;
        client.company = input.company;
        client.email = input.email ?? client.email;
      } else {
        client = {
          id: randomUUID(),
          fullName: input.fullName,
          company: input.company,
          phone: input.phone,
          email: input.email,
          createdAt: now,
        };
        db.clients.push(client);
      }

      const classification = classifyInquiry(input);
      const reply = await writeReply(input, classification);
      const inquiryId = randomUUID();
      db.inquiries.push({
        id: inquiryId,
        clientId: client.id,
        kind: input.kind,
        message: input.message,
        fleetSize: input.fleetSize,
        status: "proposition_ia",
        createdAt: now,
      });
      db.classifications.push({ inquiryId, ...classification });
      db.proposals.push({
        id: randomUUID(),
        inquiryId,
        body: reply.body,
        status: "brouillon",
        model: reply.model,
      });
      db.notifications.unshift({
        id: randomUUID(),
        inquiryId,
        title: input.kind === "devis" ? "Nouvelle demande de devis" : "Nouvelle demande d'information",
        body: `${input.fullName} · ${input.company}`,
        readAt: null,
        createdAt: now,
      });
      await writeDb(db);
      return { id: inquiryId, reply: reply.body, classification };
    });
  },

  async listInquiries() {
    return listFrom(await readDb());
  },

  async unreadCount() {
    const db = await readDb();
    return db.notifications.filter((item) => !item.readAt).length;
  },

  async listNotifications() {
    const db = await readDb();
    return [...db.notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  },

  async getInquiry(id: string) {
    return detailFrom(await readDb(), id);
  },

  async markRead(inquiryId: string) {
    await locked(async () => {
      const db = await readDb();
      const now = new Date().toISOString();
      for (const item of db.notifications) {
        if (item.inquiryId === inquiryId && !item.readAt) item.readAt = now;
      }
      const inquiry = db.inquiries.find((item) => item.id === inquiryId);
      if (inquiry?.status === "proposition_ia") inquiry.status = "en_revue";
      await writeDb(db);
    });
  },

  async saveProposal(proposalId: string, body: string, status: ProposalStatus) {
    await locked(async () => {
      const db = await readDb();
      const proposal = db.proposals.find((item) => item.id === proposalId);
      if (!proposal) return;
      proposal.body = body;
      proposal.status = status;
      await writeDb(db);
    });
  },

  async logContact(inquiryId: string, proposalId: string | null, channel: ContactChannel) {
    await locked(async () => {
      const db = await readDb();
      db.contacts.push({
        id: randomUUID(),
        inquiryId,
        proposalId,
        channel,
        createdAt: new Date().toISOString(),
      });
      const inquiry = db.inquiries.find((item) => item.id === inquiryId);
      if (inquiry) inquiry.status = "contactee";
      const proposal = proposalId ? db.proposals.find((item) => item.id === proposalId) : undefined;
      if (proposal && channel === "whatsapp") proposal.status = "envoyee";
      await writeDb(db);
    });
  },

  async setStatus(inquiryId: string, status: InquiryStatus) {
    await locked(async () => {
      const db = await readDb();
      const inquiry = db.inquiries.find((item) => item.id === inquiryId);
      if (inquiry) inquiry.status = status;
      await writeDb(db);
    });
  },
};
