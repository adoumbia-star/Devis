import { readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { pains, sectors, solutions } from "../data/catalog";
import { databaseUrl } from "./url";

function loadEnvFile(name: string) {
  try {
    const raw = readFileSync(path.join(process.cwd(), name), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // fichier absent
  }
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
  const url = databaseUrl();
  if (!url) {
    console.error("DATABASE_URL est absent. Copiez .env.example vers .env.local puis relancez.");
    process.exit(1);
  }

  const sql = neon(url);
  const schema = readFileSync(path.join(process.cwd(), "src/db/schema.sql"), "utf8");
  const statements = schema
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }

  for (const sector of sectors) {
    await sql.query(
      `INSERT INTO sectors (id, name, summary) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, summary = EXCLUDED.summary`,
      [sector.id, sector.name, sector.summary],
    );
  }

  for (const [index, solution] of solutions.entries()) {
    await sql.query(
      `INSERT INTO solutions (id, name, tagline, summary, problems, outcomes, typical_result, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         tagline = EXCLUDED.tagline,
         summary = EXCLUDED.summary,
         problems = EXCLUDED.problems,
         outcomes = EXCLUDED.outcomes,
         typical_result = EXCLUDED.typical_result,
         sort_order = EXCLUDED.sort_order`,
      [
        solution.id,
        solution.name,
        solution.tagline,
        solution.summary,
        solution.problems,
        solution.outcomes,
        solution.typicalResult,
        index,
      ],
    );
  }

  for (const pain of pains) {
    await sql.query(
      `INSERT INTO pain_points (id, label) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label`,
      [pain.id, pain.label],
    );
  }

  for (const sector of sectors) {
    for (const solutionId of sector.solutionIds) {
      await sql.query(
        `INSERT INTO solution_sectors (solution_id, sector_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [solutionId, sector.id],
      );
    }
  }

  for (const solution of solutions) {
    for (const painId of solution.painIds) {
      await sql.query(
        `INSERT INTO solution_pains (solution_id, pain_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [solution.id, painId],
      );
    }
  }

  console.log("Neon est prêt : référentiel classé, demandes encore vides.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
