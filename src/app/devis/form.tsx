"use client";

import { useActionState } from "react";
import { sectors, solutions } from "@/data/catalog";
import { submitInquiry, type FormState } from "@/app/devis/actions";

export function DevisForm({ presetSolution }: { presetSolution?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitInquiry, null);

  return (
    <form action={action} className="mt-8 space-y-5 border border-line bg-card p-5">
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm text-muted">Vous souhaitez</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="kind" value="information" />
          Une information
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="kind" value="devis" defaultChecked />
          Un devis
        </label>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" name="fullName" required />
        <Field label="Société" name="company" required />
        <Field label="Téléphone" name="phone" required type="tel" />
        <Field label="E-mail" name="email" type="email" />
        <label className="block text-sm">
          Secteur
          <select name="sectorId" className="mt-1 w-full border border-line bg-paper px-3 py-2" defaultValue="">
            <option value="">Non précisé</option>
            {sectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
        </label>
        <Field label="Nombre de véhicules ou engins" name="fleetSize" type="number" />
      </div>

      <fieldset>
        <legend className="text-sm">Solutions concernées</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {solutions.map((solution) => (
            <label key={solution.id} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="solutionIds"
                value={solution.id}
                defaultChecked={presetSolution === solution.id}
              />
              <span>
                {solution.name}
                <span className="block text-muted">{solution.tagline}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        Votre besoin
        <textarea
          name="message"
          required
          minLength={12}
          rows={5}
          placeholder="Exemple : nous perdons du carburant sur une flotte de camions citernes à Abidjan."
          className="mt-1 w-full border border-line bg-paper px-3 py-2"
        />
      </label>

      {state?.error ? <p className="text-sm text-clay">{state.error}</p> : null}

      <button type="submit" disabled={pending} className="bg-moss px-4 py-3 text-paper disabled:opacity-60">
        {pending ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full border border-line bg-paper px-3 py-2"
      />
    </label>
  );
}
