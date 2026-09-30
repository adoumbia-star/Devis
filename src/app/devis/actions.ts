"use server";

import { redirect } from "next/navigation";
import { getSector, getSolution } from "@/data/catalog";
import { createInquiry } from "@/db";
import { toWhatsappNumber } from "@/lib/phone";
import type { InquiryKind } from "@/lib/types";

export type FormState = { error: string } | null;

export async function submitInquiry(_state: FormState, formData: FormData): Promise<FormState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const companyName = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const emailRaw = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const kindRaw = String(formData.get("kind") ?? "");
  const sectorRaw = String(formData.get("sectorId") ?? "");
  const fleetRaw = String(formData.get("fleetSize") ?? "").trim();
  const solutionIds = formData.getAll("solutionIds").map(String);

  if (fullName.length < 2) return { error: "Indiquez votre nom." };
  if (companyName.length < 2) return { error: "Indiquez la société." };
  if (phone.replace(/\D/g, "").length < 8) return { error: "Indiquez un téléphone joignable." };
  if (message.length < 12) return { error: "Décrivez votre besoin en une ou deux phrases." };
  if (kindRaw !== "information" && kindRaw !== "devis") return { error: "Choisissez information ou devis." };

  const sectorId = sectorRaw && getSector(sectorRaw) ? sectorRaw : null;
  const knownSolutions = solutionIds.filter((id) => getSolution(id));
  let fleetSize: number | null = null;
  if (fleetRaw) {
    const parsed = Number(fleetRaw);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100000) {
      return { error: "Le nombre de véhicules doit être un entier." };
    }
    fleetSize = parsed;
  }

  const email = emailRaw.length === 0 ? null : emailRaw;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "L'adresse e-mail n'est pas valide." };
  }

  let id = "";
  try {
    const created = await createInquiry({
      fullName,
      company: companyName,
      phone: `+${toWhatsappNumber(phone)}`,
      email,
      kind: kindRaw as InquiryKind,
      message,
      fleetSize,
      sectorId,
      solutionIds: knownSolutions,
    });
    id = created.id;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "erreur inconnue";
    return { error: `Enregistrement impossible. ${detail}` };
  }

  redirect(`/demande/${id}`);
}
