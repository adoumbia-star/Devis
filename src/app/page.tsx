import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { sectors, solutions } from "@/data/catalog";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto grid max-w-5xl gap-8 px-5 py-14 md:grid-cols-[1.3fr_0.7fr] md:items-end">
          <div>
            <p className="text-sm tracking-[0.16em] text-clay">MAÎTRISER LES OPÉRATIONS</p>
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] text-moss-deep">
              Une information claire, puis un devis classé.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Parcourez les cinq solutions en bref. Envoyez ensuite une demande : elle est classée,
              une réponse est rédigée tout de suite, et un conseiller reprend le dossier.
            </p>
          </div>
          <aside className="border border-line bg-card p-5">
            <p className="text-sm text-muted">Secteurs couverts</p>
            <ul className="mt-3 space-y-2">
              {sectors.map((sector) => (
                <li key={sector.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{sector.name}</span>
                  <span className="text-muted">{sector.summary}</span>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section id="solutions" className="mx-auto max-w-5xl px-5 pb-8">
          <h2 className="font-serif text-3xl">Les solutions, en bref</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {solutions.map((solution) => (
              <article key={solution.id} className="flex flex-col border border-line bg-card p-5">
                <h3 className="font-serif text-2xl">{solution.name}</h3>
                <p className="mt-1 text-sm text-moss">{solution.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-6">{solution.summary}</p>
                <Link href={`/solutions/${solution.id}`} className="mt-4 text-sm underline">
                  Lire la fiche
                </Link>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
