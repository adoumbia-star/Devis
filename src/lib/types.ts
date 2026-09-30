export type InquiryKind = "information" | "devis";
export type InquiryStatus =
  | "nouvelle"
  | "classee"
  | "proposition_ia"
  | "en_revue"
  | "contactee"
  | "gagnee"
  | "perdue";
export type Urgency = "basse" | "normale" | "haute";
export type FleetBand = "inconnue" | "petite" | "moyenne" | "grande";
export type SolutionRelation = "demandee" | "suggeree";
export type ProposalStatus = "brouillon" | "modifiee" | "approuvee" | "envoyee" | "rejetee";
export type ContactChannel = "telephone" | "whatsapp";

export type Classification = {
  sectorId: string | null;
  painIds: string[];
  solutions: { solutionId: string; relation: SolutionRelation }[];
  urgency: Urgency;
  fleetBand: FleetBand;
  confidence: number;
  method: "regles";
};

export type InquiryInput = {
  fullName: string;
  company: string;
  phone: string;
  email: string | null;
  kind: InquiryKind;
  message: string;
  fleetSize: number | null;
  sectorId: string | null;
  solutionIds: string[];
};

export type InquiryListItem = {
  id: string;
  kind: InquiryKind;
  status: InquiryStatus;
  createdAt: string;
  fullName: string;
  company: string;
  phone: string;
  sectorId: string | null;
  urgency: Urgency | null;
  solutionIds: string[];
  unread: boolean;
};

export type InquiryDetail = {
  id: string;
  kind: InquiryKind;
  status: InquiryStatus;
  message: string;
  fleetSize: number | null;
  createdAt: string;
  client: {
    fullName: string;
    company: string;
    phone: string;
    email: string | null;
  };
  classification: Classification | null;
  proposal: {
    id: string;
    body: string;
    status: ProposalStatus;
    model: string;
  } | null;
  contacts: { id: string; channel: ContactChannel; createdAt: string }[];
};

export type AppNotification = {
  id: string;
  inquiryId: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};
