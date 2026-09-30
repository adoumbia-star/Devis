export const company = {
  name: "SUD CONTRACTORS",
  site: "https://www.sudcontractors.com",
  email: "contact@sudcontractors.com",
  phones: [
    { label: "27 21 20 17 23", e164: "+2252721201723" },
    { label: "01 42 42 44 54", e164: "+2250142424454" },
    { label: "07 77 28 51 51", e164: "+2250777285151" },
  ],
};

export type PainId =
  | "visibilite"
  | "trajets"
  | "carburant"
  | "incidents"
  | "stocks"
  | "froid";

export type Sector = {
  id: string;
  name: string;
  summary: string;
  solutionIds: string[];
};

export type Solution = {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  problems: string[];
  outcomes: string[];
  typicalResult: string;
  painIds: PainId[];
};

export const pains: { id: PainId; label: string; keywords: string[] }[] = [
  {
    id: "visibilite",
    label: "Manque de visibilité terrain",
    keywords: ["visibilité", "visibilite", "localisation", "suivi", "gps", "flotte", "où sont", "ou sont"],
  },
  {
    id: "trajets",
    label: "Trajets et usages non autorisés",
    keywords: ["trajet", "personnel", "détournement", "detournement", "horaire", "kilomètre", "kilometre"],
  },
  {
    id: "carburant",
    label: "Pertes et vols de carburant",
    keywords: ["carburant", "gasoil", "gazole", "siphon", "litre", "consommation", "vol de"],
  },
  {
    id: "incidents",
    label: "Incidents et litiges",
    keywords: ["incident", "litige", "caméra", "camera", "accident", "vidéo", "video", "preuve"],
  },
  {
    id: "stocks",
    label: "Écarts de stock carburant",
    keywords: ["cuve", "citerne", "stock", "écart", "ecart", "inventaire", "dépôt", "depot", "ravitaillement"],
  },
  {
    id: "froid",
    label: "Rupture de chaîne du froid",
    keywords: ["froid", "température", "temperature", "chaîne du froid", "chaine du froid", "frigo", "agro"],
  },
];

export const solutions: Solution[] = [
  {
    id: "provision",
    name: "ProVision",
    tagline: "Suivi des véhicules et des opérations terrain",
    summary:
      "ProVision donne une visibilité continue sur les véhicules, les trajets et les horaires, pour limiter les usages non autorisés.",
    problems: [
      "Manque de visibilité sur les véhicules",
      "Utilisations non autorisées",
      "Trajets et horaires non maîtrisés",
    ],
    outcomes: [
      "Usage limité aux heures autorisées",
      "Contrôle des itinéraires et des arrêts",
      "Moins d'usages non autorisés",
    ],
    typicalResult: "Environ −18 % de kilomètres non productifs observés chez des clients transport.",
    painIds: ["visibilite", "trajets"],
  },
  {
    id: "provision-plus",
    name: "ProVision+",
    tagline: "Contrôle avancé du carburant des engins",
    summary:
      "ProVision+ relie les réservoirs à des capteurs pour voir la consommation réelle et signaler siphonnages et écarts.",
    problems: [
      "Consommations anormales",
      "Vols et siphonnages",
      "Écart entre consommation théorique et réelle",
    ],
    outcomes: [
      "Détection rapide des anomalies carburant",
      "Baisse des pertes",
      "Historique des consommations",
    ],
    typicalResult: "Environ −30 % de pertes carburant observées sur des flottes suivies.",
    painIds: ["carburant"],
  },
  {
    id: "procam",
    name: "ProCam",
    tagline: "Vidéoprotection embarquée",
    summary:
      "ProCam filme les situations à risque et fournit une preuve vidéo en cas d'incident ou de litige.",
    problems: [
      "Incidents et litiges sans preuve",
      "Comportements à risque",
      "Manque de traces vidéo",
    ],
    outcomes: [
      "Preuve vidéo des incidents",
      "Moins de contestations",
      "Meilleur contrôle des comportements",
    ],
    typicalResult: "Les litiges se clarifient avec une preuve vidéo, sans pourcentage publié sur le site.",
    painIds: ["incidents"],
  },
  {
    id: "profuel",
    name: "ProFuel",
    tagline: "Stocks carburant, cuves et citernes",
    summary:
      "ProFuel supervise les cuves fixes et les citernes mobiles : volumes, entrées, sorties et écarts de stock.",
    problems: [
      "Écarts de stock fréquents",
      "Mouvements non tracés",
      "Inventaires lents",
    ],
    outcomes: [
      "Écarts détectés plus tôt",
      "Mouvements tracés",
      "Inventaires plus fiables",
    ],
    typicalResult: "Environ −25 % d'écarts de stock observés sur des dépôts suivis.",
    painIds: ["stocks"],
  },
  {
    id: "protemp",
    name: "ProTemp",
    tagline: "Surveillance de la chaîne du froid",
    summary:
      "ProTemp surveille les températures en continu et alerte dès qu'une rupture menace la marchandise.",
    problems: [
      "Ruptures de chaîne du froid",
      "Variations de température",
      "Perte de qualité des produits",
    ],
    outcomes: [
      "Alerte immédiate en cas de rupture",
      "Historique des températures",
      "Moins de marchandises perdues",
    ],
    typicalResult: "Environ −35 % de pertes liées à la température chez des clients agro-alimentaires.",
    painIds: ["froid"],
  },
];

export const sectors: Sector[] = [
  {
    id: "btp",
    name: "BTP",
    summary: "Suivi des chantiers, des engins et des équipes.",
    solutionIds: ["provision", "provision-plus", "procam"],
  },
  {
    id: "transport",
    name: "Transport",
    summary: "Flotte, trajets, conduite et coût carburant.",
    solutionIds: ["provision", "provision-plus", "procam", "profuel"],
  },
  {
    id: "hydrocarbures",
    name: "Hydrocarbures",
    summary: "Livraisons, citernes et stocks carburant.",
    solutionIds: ["provision", "provision-plus", "profuel", "procam"],
  },
  {
    id: "mines",
    name: "Mines",
    summary: "Équipements, zones d'exploitation et sécurité.",
    solutionIds: ["provision", "provision-plus", "procam"],
  },
  {
    id: "agro-industrie",
    name: "Agro-industrie",
    summary: "Traçabilité, stocks et températures.",
    solutionIds: ["protemp", "provision", "profuel"],
  },
  {
    id: "logistique-froid",
    name: "Logistique / Froid",
    summary: "Flux, entrepôts et respect de la chaîne du froid.",
    solutionIds: ["protemp", "provision", "procam"],
  },
];

export function getSolution(id: string) {
  return solutions.find((solution) => solution.id === id);
}

export function getSector(id: string) {
  return sectors.find((sector) => sector.id === id);
}

export function getPain(id: string) {
  return pains.find((pain) => pain.id === id);
}
