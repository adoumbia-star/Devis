#!/usr/bin/env bash
# Déploiement complet : bases Neon (production + preview), référentiel chargé,
# variables d'environnement Vercel, puis mise en production.
#
# Requis   : NEON_API_KEY, VERCEL_TOKEN, ADMIN_PASSWORD
# Optionnel: ADMIN_SECRET (généré sinon), OPENAI_API_KEY, OPENAI_MODEL,
#            PROJECT_NAME (devis-sud-contractors), NEON_REGION (aws-eu-central-1),
#            VERCEL_SCOPE (équipe Vercel)
set -euo pipefail
cd "$(dirname "$0")/.."

: "${NEON_API_KEY:?NEON_API_KEY manquant (console.neon.tech → Account settings → API keys)}"
: "${VERCEL_TOKEN:?VERCEL_TOKEN manquant (vercel.com/account/tokens)}"
: "${ADMIN_PASSWORD:?ADMIN_PASSWORD manquant}"

PROJECT_NAME="${PROJECT_NAME:-devis-sud-contractors}"
NEON_REGION="${NEON_REGION:-aws-eu-central-1}"
ADMIN_SECRET="${ADMIN_SECRET:-$(openssl rand -hex 32)}"

neon() { npx --yes neonctl@7 --api-key "$NEON_API_KEY" --no-analytics "$@"; }
vc() {
  local scope=()
  [[ -n "${VERCEL_SCOPE:-}" ]] && scope=(--scope "$VERCEL_SCOPE")
  npx --yes vercel@61 --token "$VERCEL_TOKEN" "${scope[@]}" "$@"
}
json() { node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));$1" -- "${@:2}"; }

echo "== Neon : projet ${PROJECT_NAME} (${NEON_REGION})"
project_id=$(neon projects list -o json | json '
  const list = Array.isArray(d) ? d : [...(d.projects ?? []), ...(d.shared_with_you ?? [])];
  const p = list.find((p) => p.name === process.argv[1]);
  if (p) process.stdout.write(p.id);' "$PROJECT_NAME")

if [[ -z "$project_id" ]]; then
  project_id=$(neon projects create --name "$PROJECT_NAME" --region-id "$NEON_REGION" --no-secrets -o json \
    | json 'process.stdout.write(d.project.id)')
  echo "   projet créé : $project_id"
else
  echo "   projet existant : $project_id"
fi

if ! neon branches get preview --project-id "$project_id" -o json >/dev/null 2>&1; then
  neon branches create --project-id "$project_id" --name preview --no-secrets -o json >/dev/null
  echo "   branche preview créée"
fi

prod_url=$(neon connection-string --project-id "$project_id" --pooled)
preview_url=$(neon connection-string preview --project-id "$project_id" --pooled)

echo "== Schéma et référentiel"
DATABASE_URL="$prod_url" npm run --silent db:setup
DATABASE_URL="$preview_url" npm run --silent db:setup

echo "== Vercel : projet ${PROJECT_NAME}"
vc project add "$PROJECT_NAME" >/dev/null 2>&1 || true
vc link --yes --project "$PROJECT_NAME" >/dev/null
# Liaison GitHub : nécessite l'application GitHub de Vercel installée sur le dépôt
# (vercel.com/dashboard → Settings → Git). Sinon on continue en déploiement direct.
vc git connect --yes >/dev/null 2>&1 \
  && echo "   dépôt GitHub lié : chaque push sur main déploiera" \
  || echo "   dépôt GitHub non lié (installer l'app GitHub de Vercel), déploiement direct"

set_env() { printf '%s' "$2" | vc env add "$1" "$3" --force >/dev/null; }
set_env DATABASE_URL "$prod_url" production
set_env DATABASE_URL "$preview_url" preview
set_env ADMIN_PASSWORD "$ADMIN_PASSWORD" production,preview
set_env ADMIN_SECRET "$ADMIN_SECRET" production,preview
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  set_env OPENAI_API_KEY "$OPENAI_API_KEY" production,preview
  set_env OPENAI_MODEL "${OPENAI_MODEL:-gpt-4o-mini}" production,preview
fi

echo "== Mise en production"
url=$(vc deploy --prod --yes)
echo
echo "Déployé : $url"
echo "Admin   : $url/admin/login"
