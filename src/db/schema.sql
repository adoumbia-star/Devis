CREATE TABLE IF NOT EXISTS sectors (
  id text PRIMARY KEY,
  name text NOT NULL,
  summary text NOT NULL
);

CREATE TABLE IF NOT EXISTS solutions (
  id text PRIMARY KEY,
  name text NOT NULL,
  tagline text NOT NULL,
  summary text NOT NULL,
  problems text[] NOT NULL,
  outcomes text[] NOT NULL,
  typical_result text NOT NULL,
  sort_order int NOT NULL
);

CREATE TABLE IF NOT EXISTS solution_sectors (
  solution_id text NOT NULL REFERENCES solutions(id),
  sector_id text NOT NULL REFERENCES sectors(id),
  PRIMARY KEY (solution_id, sector_id)
);

CREATE TABLE IF NOT EXISTS pain_points (
  id text PRIMARY KEY,
  label text NOT NULL
);

CREATE TABLE IF NOT EXISTS solution_pains (
  solution_id text NOT NULL REFERENCES solutions(id),
  pain_id text NOT NULL REFERENCES pain_points(id),
  PRIMARY KEY (solution_id, pain_id)
);

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY,
  full_name text NOT NULL,
  company text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES clients(id),
  kind text NOT NULL CHECK (kind IN ('information', 'devis')),
  message text NOT NULL,
  fleet_size int,
  status text NOT NULL CHECK (status IN (
    'nouvelle', 'classee', 'proposition_ia', 'en_revue', 'contactee', 'gagnee', 'perdue'
  )),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_created_idx ON inquiries (created_at DESC);

CREATE TABLE IF NOT EXISTS inquiry_classifications (
  inquiry_id uuid PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
  sector_id text REFERENCES sectors(id),
  urgency text NOT NULL CHECK (urgency IN ('basse', 'normale', 'haute')),
  fleet_band text NOT NULL CHECK (fleet_band IN ('inconnue', 'petite', 'moyenne', 'grande')),
  confidence numeric(3,2) NOT NULL,
  method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inquiry_solutions (
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  solution_id text NOT NULL REFERENCES solutions(id),
  relation text NOT NULL CHECK (relation IN ('demandee', 'suggeree')),
  PRIMARY KEY (inquiry_id, solution_id)
);

CREATE TABLE IF NOT EXISTS inquiry_pains (
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  pain_id text NOT NULL REFERENCES pain_points(id),
  PRIMARY KEY (inquiry_id, pain_id)
);

CREATE TABLE IF NOT EXISTS ai_proposals (
  id uuid PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  body text NOT NULL,
  status text NOT NULL CHECK (status IN ('brouillon', 'modifiee', 'approuvee', 'envoyee', 'rejetee')),
  model text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_proposals_inquiry_idx ON ai_proposals (inquiry_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at DESC);

CREATE TABLE IF NOT EXISTS contact_logs (
  id uuid PRIMARY KEY,
  inquiry_id uuid NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES ai_proposals(id),
  channel text NOT NULL CHECK (channel IN ('telephone', 'whatsapp')),
  created_at timestamptz NOT NULL DEFAULT now()
);
