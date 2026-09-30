import { LoginForm } from "@/app/admin/login/form";
import { devPasswordHint } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <p className="text-xs tracking-[0.18em] text-moss">SUD CONTRACTORS</p>
      <h1 className="mt-2 font-serif text-4xl">Poste administrateur</h1>
      <p className="mt-3 text-sm text-muted">Demandes classées, propositions de réponse, appel et WhatsApp.</p>
      <LoginForm hint={devPasswordHint()} />
    </main>
  );
}
