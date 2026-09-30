"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

export function LoginForm({ hint }: { hint: string | null }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, null);

  return (
    <form action={action} className="mt-8 space-y-4 border border-line bg-card p-5">
      <label className="block text-sm">
        Mot de passe
        <input name="password" type="password" required className="mt-1 w-full border border-line bg-paper px-3 py-2" />
      </label>
      {hint ? <p className="text-sm text-muted">Mot de passe local tant qu&apos;il n&apos;est pas défini : {hint}</p> : null}
      {state?.error ? <p className="text-sm text-clay">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="bg-moss px-4 py-3 text-paper disabled:opacity-60">
        {pending ? "Entrée…" : "Entrer"}
      </button>
    </form>
  );
}
