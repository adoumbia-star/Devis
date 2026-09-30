import Link from "next/link";
import { notFound } from "next/navigation";
import { ProposalPanel } from "@/app/admin/(console)/[id]/proposal-panel";
import { AdminBar } from "@/components/admin-bar";
import { getPain, getSector, getSolution } from "@/data/catalog";
import { getInquiry, markRead } from "@/db";
import { formatWhen, label } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = await getInquiry(id);
  if (!existing) notFound();
  await markRead(id);
  const inquiry = await getInquiry(id);
  if (!inquiry) notFound();

  const sector = inquiry.classification?.sectorId ? getSector(inquiry.classification.sectorId) : undefined;

  return (
    <div className="space-y-6">
      <AdminBar />
      <p className="text-sm">
        <Link href="/admin" className="underline">
          Toutes les demandes
        </Link>
      </p>
      <header>
        <h1 className="font-serif text-4xl">{inquiry.client.company}</h1>
        <p className="mt-2 text-muted">
          {inquiry.client.fullName} · {inquiry.client.phone}
          {inquiry.client.email ? ` · ${inquiry.client.email}` : ""} · {formatWhen(inquiry.createdAt)}
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <section className="border border-line bg-card p-5">
            <h2 className="font-serif text-2xl">Message</h2>
            <p className="mt-2 text-sm text-muted">
              {label(inquiry.kind)} · {label(inquiry.status)}
              {inquiry.fleetSize ? ` · ${inquiry.fleetSize} engins` : ""}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{inquiry.message}</p>
          </section>

          <section className="border border-line bg-card p-5">
            <h2 className="font-serif text-2xl">Classement</h2>
            {inquiry.classification ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-muted">Secteur</dt>
                  <dd>{sector ? `${sector.name} — ${sector.summary}` : "Non précisé"}</dd>
                </div>
                <div>
                  <dt className="text-muted">Urgence et flotte</dt>
                  <dd>
                    {label(inquiry.classification.urgency)} · {label(inquiry.classification.fleetBand)} · confiance{" "}
                    {Math.round(inquiry.classification.confidence * 100)} %
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Sujets</dt>
                  <dd>
                    {inquiry.classification.painIds.length === 0
                      ? "Aucun sujet détecté"
                      : inquiry.classification.painIds.map((painId) => getPain(painId)?.label).join(", ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Solutions</dt>
                  <dd className="space-y-1">
                    {inquiry.classification.solutions.map((item) => (
                      <p key={item.solutionId}>
                        {getSolution(item.solutionId)?.name} · {label(item.relation)}
                      </p>
                    ))}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm">Demande non classée.</p>
            )}
          </section>

          <section className="border border-line bg-card p-5">
            <h2 className="font-serif text-2xl">Contacts</h2>
            {inquiry.contacts.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Pas encore d&apos;appel ni de WhatsApp.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm">
                {inquiry.contacts.map((contact) => (
                  <li key={contact.id}>
                    {label(contact.channel)} · {formatWhen(contact.createdAt)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {inquiry.proposal ? (
          <ProposalPanel
            inquiryId={inquiry.id}
            proposalId={inquiry.proposal.id}
            initialBody={inquiry.proposal.body}
            phone={inquiry.client.phone}
            status={inquiry.status}
          />
        ) : (
          <p>Aucune proposition.</p>
        )}
      </div>
    </div>
  );
}
