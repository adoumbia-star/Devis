import Link from "next/link";
import { company } from "@/data/catalog";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="leading-tight">
          <span className="block text-xs tracking-[0.18em] text-moss">SUD CONTRACTORS</span>
          <span className="font-serif text-lg">Information & devis</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/#solutions" className="text-muted hover:text-ink">
            Solutions
          </Link>
          <Link href="/devis" className="bg-moss px-3 py-2 text-paper hover:bg-moss-deep">
            Demander un devis
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          {company.name} ·{" "}
          <a className="underline" href={company.site}>
            sudcontractors.com
          </a>
        </p>
        <p>
          {company.phones.map((phone) => phone.label).join(" · ")} · {company.email}
        </p>
      </div>
    </footer>
  );
}
