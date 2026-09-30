import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { storageMode } from "@/db";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-moss-deep text-paper">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs tracking-[0.16em] text-[#b7d7c9]">ADMINISTRATION</p>
            <Link href="/admin" className="font-serif text-2xl">
              Demandes clients
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <form action={logout}>
              <button type="submit" className="border border-white/30 px-3 py-1">
                Quitter
              </button>
            </form>
          </div>
        </div>
      </header>
      {storageMode() === "local" ? (
        <p className="bg-[#f3e2c8] px-5 py-2 text-center text-sm text-ink">
          Base locale temporaire. Ajoutez DATABASE_URL puis lancez npm run db:setup pour classer les demandes dans Neon.
        </p>
      ) : (
        <p className="bg-moss px-5 py-2 text-center text-sm text-paper">Classement actif dans Neon PostgreSQL.</p>
      )}
      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>
    </div>
  );
}
