import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getPain, getSector, getSolution } from "@/data/catalog";
import { getInquiry, storageMode } from "@/db";

export const dynamic = "force-dynamic";

export default async function DemandePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inquiry = await getInquiry(id);
  if (!inquiry || !inquiry.proposal) notFound();

  const sector = inquiry.classification?.sectorId ? getSector(inquiry.classification.sectorId) : undefined;
  const pains = inquiry.classification?.painIds.map((painId) => getPain(painId)?.label).filter(Boolean) ?? [];
  const names =
    inquiry.classification?.solutions
      .map((item) => getSolution(item.solutionId)?.name)
      .filter(Boolean)
      .join(", ") ?? "";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm tracking-[0.16em] text-moss">RÉPONSE</p>
        <h1 className="mt-2 font-serif text-5xl">Votre demande est enregistrée</h1>
        <p className="mt-4 text-muted">
          {sector ? `Secteur retenu : ${sector.name}. ` : ""}
          {names ? `Solutions : ${names}. ` : ""}
          {pains.length > 0 ? `Sujets : ${pains.join(", ")}.` : ""}
        </p>
        {storageMode() === "local" ? (
          <p className="mt-4 border border-line bg-card px-4 py-3 text-sm">
            Mode local : la demande est dans un fichier de travail. Branchez Neon pour la classer dans PostgreSQL.
          </p>
        ) : null}
        <article className="mt-8 whitespace-pre-wrap border border-line bg-card p-5 leading-7">
          {inquiry.proposal.body}
        </article>
        <p className="mt-6 text-sm text-muted">
          Un conseiller peut reprendre ce texte, puis vous appeler ou vous écrire sur WhatsApp.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm underline">
          Retour aux solutions
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
