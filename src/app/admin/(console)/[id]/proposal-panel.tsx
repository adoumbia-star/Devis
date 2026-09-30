"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordContact, updateProposal, updateStatus } from "@/app/admin/actions";
import { telHref, whatsappHref } from "@/lib/phone";
import type { InquiryStatus, ProposalStatus } from "@/lib/types";

export function ProposalPanel({
  inquiryId,
  proposalId,
  initialBody,
  phone,
  status,
}: {
  inquiryId: string;
  proposalId: string;
  initialBody: string;
  phone: string;
  status: InquiryStatus;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function run(task: () => Promise<void>, done: string) {
    setNote(null);
    startTransition(async () => {
      await task();
      setNote(done);
      router.refresh();
    });
  }

  return (
    <section className="border border-line bg-card p-5">
      <h2 className="font-serif text-2xl">Proposition de réponse</h2>
      <p className="mt-1 text-sm text-muted">
        Le texte part au client sur la page de confirmation. Vous pouvez le corriger avant l&apos;appel ou WhatsApp.
      </p>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={14}
        className="mt-4 w-full border border-line bg-paper px-3 py-2 text-sm leading-6"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateProposal(proposalId, body, "modifiee" satisfies ProposalStatus), "Texte enregistré.")}
          className="border border-ink px-3 py-2 text-sm"
        >
          Enregistrer
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateProposal(proposalId, body, "approuvee"), "Proposition approuvée.")}
          className="bg-moss px-3 py-2 text-sm text-paper"
        >
          Approuver
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => updateProposal(proposalId, body, "rejetee"), "Proposition rejetée.")}
          className="border border-line px-3 py-2 text-sm"
        >
          Rejeter
        </button>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(async () => {
              await recordContact(inquiryId, proposalId, "telephone");
              window.location.href = telHref(phone);
            }, "Appel enregistré.")
          }
          className="bg-ink px-3 py-2 text-sm text-paper"
        >
          Appeler
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(async () => {
              await recordContact(inquiryId, proposalId, "whatsapp");
              window.open(whatsappHref(phone, body), "_blank", "noopener,noreferrer");
            }, "WhatsApp ouvert avec le texte.")
          }
          className="bg-[#1d6b45] px-3 py-2 text-sm text-paper"
        >
          WhatsApp
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={pending || status === "gagnee"}
          onClick={() => run(() => updateStatus(inquiryId, "gagnee"), "Demande marquée gagnée.")}
          className="text-sm underline"
        >
          Marquer gagnée
        </button>
        <button
          type="button"
          disabled={pending || status === "perdue"}
          onClick={() => run(() => updateStatus(inquiryId, "perdue"), "Demande marquée perdue.")}
          className="text-sm underline"
        >
          Marquer perdue
        </button>
      </div>
      {note ? <p className="mt-3 text-sm text-moss">{note}</p> : null}
    </section>
  );
}
