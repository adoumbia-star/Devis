import { getPain, getSector, getSolution } from "@/data/catalog";
import type { Classification, InquiryInput } from "@/lib/types";

export function draftReply(input: InquiryInput, classification: Classification) {
  const sector = classification.sectorId ? getSector(classification.sectorId) : undefined;
  const requested = classification.solutions.filter((item) => item.relation === "demandee");
  const suggested = classification.solutions.filter((item) => item.relation === "suggeree");
  const lines = [
    `Bonjour ${input.fullName},`,
    "",
    input.kind === "devis"
      ? `Nous avons bien reçu votre demande de devis pour ${input.company}.`
      : `Nous avons bien reçu votre demande d'information pour ${input.company}.`,
  ];

  if (sector) {
    lines.push(`Votre activité est classée dans le secteur ${sector.name} : ${sector.summary}`);
  }

  const painLabels = classification.painIds
    .map((id) => getPain(id)?.label)
    .filter((label): label is string => Boolean(label));
  if (painLabels.length > 0) {
    lines.push(`Points relevés dans votre message : ${painLabels.join(", ")}.`);
  }

  const describe = (ids: typeof requested) =>
    ids
      .map((item) => getSolution(item.solutionId))
      .filter((solution): solution is NonNullable<typeof solution> => Boolean(solution))
      .map((solution) => `• ${solution.name} — ${solution.tagline}. ${solution.summary}`);

  if (requested.length > 0) {
    lines.push("", "Solutions demandées :", ...describe(requested));
  }
  if (suggested.length > 0) {
    lines.push("", "Pistes complémentaires, à confirmer avec vous :", ...describe(suggested));
  }

  if (input.fleetSize) {
    lines.push("", `Base indiquée pour le chiffrage : ${input.fleetSize} véhicule(s) ou équipement(s).`);
  }

  lines.push(
    "",
    "Cette réponse vous oriente. Elle ne contient pas de prix : le devis chiffré est préparé par un conseiller, en général sous 24 heures.",
    "",
    "SUD CONTRACTORS",
    "contact@sudcontractors.com",
    "27 21 20 17 23",
  );

  return lines.join("\n");
}

export async function writeReply(input: InquiryInput, classification: Classification) {
  const fallback = draftReply(input, classification);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { body: fallback, model: "catalogue" };

  const catalog = classification.solutions
    .map((item) => {
      const solution = getSolution(item.solutionId);
      if (!solution) return null;
      return {
        relation: item.relation,
        name: solution.name,
        tagline: solution.tagline,
        summary: solution.summary,
        problems: solution.problems,
        outcomes: solution.outcomes,
        typicalResult: solution.typicalResult,
      };
    })
    .filter(Boolean);

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

  try {
    const response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content:
              "Tu es l'assistant de SUD CONTRACTORS (Côte d'Ivoire). Tu réponds en français, de façon brève et concrète, au client qui demande une information ou un devis. Tu n'inventes aucun prix, aucun délai de pose, aucune fonction absente du catalogue fourni. Tu t'appuies sur la classification déjà faite. Tu proposes un échange avec un conseiller pour le chiffrage. Tu signes SUD CONTRACTORS.",
          },
          {
            role: "user",
            content: JSON.stringify({
              client: {
                nom: input.fullName,
                societe: input.company,
                type: input.kind,
                message: input.message,
                flotte: input.fleetSize,
              },
              classification,
              catalogue: catalog,
            }),
          },
        ],
      }),
    });

    if (!response.ok) return { body: fallback, model: "catalogue" };
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const body = payload.choices?.[0]?.message?.content?.trim();
    if (!body) return { body: fallback, model: "catalogue" };
    return { body, model };
  } catch {
    return { body: fallback, model: "catalogue" };
  }
}
