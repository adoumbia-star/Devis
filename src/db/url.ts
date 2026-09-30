/** Connection string Neon, y compris le préfixe ajouté par l'intégration Vercel. */
export function databaseUrl(): string | undefined {
  const direct = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (direct) return direct;

  const entries = Object.entries(process.env);
  const pooled = entries.find(([key, value]) => Boolean(value) && key.endsWith("_DATABASE_URL"));
  if (pooled?.[1]) return pooled[1];

  const postgres = entries.find(([key, value]) => Boolean(value) && key.endsWith("_POSTGRES_URL"));
  return postgres?.[1];
}
