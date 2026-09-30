import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getSolution, solutions } from "@/data/catalog";

export function generateStaticParams() {
  return solutions.map((solution) => ({ slug: solution.id }));
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <p className="text-sm text-muted">
          <Link href="/#solutions" className="underline">
            Solutions
          </Link>
        </p>
        <h1 className="mt-3 font-serif text-5xl">{solution.name}</h1>
        <p className="mt-2 text-lg text-moss">{solution.tagline}</p>
        <p className="mt-6 text-lg leading-8">{solution.summary}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="border border-line bg-card p-5">
            <h2 className="font-serif text-xl">Problèmes traités</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {solution.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </section>
          <section className="border border-line bg-card p-5">
            <h2 className="font-serif text-xl">Résultats visés</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {solution.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-6 border-l-2 border-clay pl-4 text-sm text-muted">{solution.typicalResult}</p>

        <Link
          href={`/devis?solution=${solution.id}`}
          className="mt-8 inline-block bg-clay px-4 py-3 text-paper"
        >
          Demander un devis pour {solution.name}
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
