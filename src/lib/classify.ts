import { getSector, pains, sectors, solutions } from "@/data/catalog";
import type { Classification, FleetBand, Urgency } from "@/lib/types";

const urgentWords = ["urgent", "urgence", "rapidement", "aujourd'hui", "aujourdhui", "critique", "dès que possible", "des que possible"];
const calmWords = ["pas pressé", "pas presse", "simple information", "juste une question"];

export function classifyInquiry(input: {
  message: string;
  sectorId: string | null;
  solutionIds: string[];
  fleetSize: number | null;
}): Classification {
  const text = input.message.toLowerCase();
  const knownSolutions = new Set(solutions.map((solution) => solution.id));
  const requested = [...new Set(input.solutionIds.filter((id) => knownSolutions.has(id)))];

  const painIds = pains
    .filter((pain) => pain.keywords.some((keyword) => text.includes(keyword)))
    .map((pain) => pain.id);

  for (const solutionId of requested) {
    const solution = solutions.find((item) => item.id === solutionId);
    if (!solution) continue;
    for (const painId of solution.painIds) {
      if (!painIds.includes(painId)) painIds.push(painId);
    }
  }

  const sector = input.sectorId ? getSector(input.sectorId) : undefined;
  const allowed = new Set(sector?.solutionIds ?? solutions.map((solution) => solution.id));

  const suggested: string[] = [];
  for (const painId of painIds) {
    for (const solution of solutions) {
      if (!solution.painIds.includes(painId as (typeof solution.painIds)[number])) continue;
      if (!allowed.has(solution.id)) continue;
      if (requested.includes(solution.id) || suggested.includes(solution.id)) continue;
      suggested.push(solution.id);
    }
  }

  if (requested.length === 0 && suggested.length === 0 && sector) {
    for (const solutionId of sector.solutionIds) suggested.push(solutionId);
  }

  let confidence = 0.35;
  if (sector) confidence += 0.25;
  if (requested.length > 0) confidence += 0.2;
  if (painIds.length > 0) confidence += 0.1;
  if (input.fleetSize) confidence += 0.05;
  if (text.trim().length > 40) confidence += 0.05;
  confidence = Math.min(0.95, Number(confidence.toFixed(2)));

  return {
    sectorId: sector?.id ?? null,
    painIds,
    solutions: [
      ...requested.map((solutionId) => ({ solutionId, relation: "demandee" as const })),
      ...suggested.map((solutionId) => ({ solutionId, relation: "suggeree" as const })),
    ],
    urgency: urgencyFrom(text),
    fleetBand: fleetBandFrom(input.fleetSize),
    confidence,
    method: "regles",
  };
}

function urgencyFrom(text: string): Urgency {
  if (urgentWords.some((word) => text.includes(word))) return "haute";
  if (calmWords.some((word) => text.includes(word))) return "basse";
  return "normale";
}

function fleetBandFrom(fleetSize: number | null): FleetBand {
  if (!fleetSize || fleetSize < 1) return "inconnue";
  if (fleetSize <= 15) return "petite";
  if (fleetSize <= 80) return "moyenne";
  return "grande";
}

export function sectorChoices() {
  return sectors;
}
