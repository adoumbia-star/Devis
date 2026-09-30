export const statusLabel: Record<string, string> = {
  nouvelle: "Nouvelle",
  classee: "Classée",
  proposition_ia: "Réponse IA prête",
  en_revue: "En revue",
  contactee: "Client contacté",
  gagnee: "Gagnée",
  perdue: "Perdue",
  information: "Information",
  devis: "Devis",
  basse: "Peu urgente",
  normale: "Normale",
  haute: "Urgente",
  inconnue: "Flotte non précisée",
  petite: "Petite flotte",
  moyenne: "Flotte moyenne",
  grande: "Grande flotte",
  demandee: "Demandée",
  suggeree: "Suggérée",
  brouillon: "Brouillon IA",
  modifiee: "Modifiée",
  approuvee: "Approuvée",
  envoyee: "Envoyée",
  rejetee: "Rejetée",
  telephone: "Téléphone",
  whatsapp: "WhatsApp",
  catalogue: "Catalogue",
};

export function label(value: string | null | undefined) {
  if (!value) return "—";
  return statusLabel[value] ?? value;
}

export function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Abidjan",
  }).format(new Date(iso));
}
