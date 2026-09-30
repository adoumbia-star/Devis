import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSolution } from "@/data/catalog";
import { DevisForm } from "@/app/devis/form";

export default async function DevisPage({
  searchParams,
}: {
  searchParams: Promise<{ solution?: string }>;
}) {
  const { solution } = await searchParams;
  const preset = solution ? getSolution(solution) : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm tracking-[0.16em] text-clay">DEMANDE</p>
        <h1 className="mt-2 font-serif text-5xl">Information ou devis</h1>
        <p className="mt-4 text-muted">
          {preset
            ? `La fiche ${preset.name} est déjà cochée. Complétez le contexte : la demande est classée, puis une réponse vous est proposée immédiatement.`
            : "Décrivez le contexte. La demande est classée par secteur, solution et urgence, puis une réponse vous est proposée immédiatement."}
        </p>
        <DevisForm presetSolution={preset?.id} />
      </main>
      <SiteFooter />
    </>
  );
}
