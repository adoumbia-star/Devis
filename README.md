# Information et devis — SUD CONTRACTORS

Petit outil pour qualifier une demande client sur les solutions du site [sudcontractors.com](https://www.sudcontractors.com/), répondre tout de suite, et laisser l'administrateur reprendre la main.

## Ordre de travail

1. **Commencer par le classement.** Le référentiel (secteurs, solutions, sujets) et les tables de demandes vivent dans `src/db/schema.sql`. C'est le socle Neon.
2. **Fiches courtes**, puis formulaire d'information ou de devis.
3. **À l'envoi**, des règles classent la demande (secteur, sujets, solutions demandées ou suggérées, urgence, taille de flotte). L'écriture de la réponse vient après, elle ne décide pas du classement.
4. **Le client voit la réponse** sur la page de confirmation. Sans clé d'API, le texte est rédigé depuis le catalogue classé. Avec `OPENAI_API_KEY`, le modèle rédige à partir de ce même classement, sans inventer de prix.
5. **Terminer par le poste administrateur** : notifications, lecture du dossier, correction ou approbation de la proposition, appel téléphonique et WhatsApp.

## Lancer

```bash
npm install
npm run dev
```

Sans `DATABASE_URL`, les demandes sont écrites dans `.data/db.json` pour pouvoir essayer le parcours. Le mot de passe admin local est `admin`.

## Brancher Neon

1. Créer une base sur [Neon](https://console.neon.tech/).
2. Copier `.env.example` vers `.env.local` et renseigner `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SECRET`.
3. `npm run db:setup` crée les tables et charge le référentiel.
4. Relancer `npm run dev`. Les nouvelles demandes sont alors classées dans PostgreSQL.

## Déployer sur Vercel

### Depuis le tableau de bord (sans clé d'API)

1. [Importer le dépôt dans Vercel](https://vercel.com/new/import?s=https://github.com/adoumbia-star/Devis). Au premier import, Vercel demande d'installer son application GitHub sur le compte `adoumbia-star` : c'est cette étape qui lie le dépôt au projet et déclenche un déploiement à chaque push sur `main`.
2. Dans le projet : Storage → Create Database → Neon. Vercel renseigne `DATABASE_URL`.
3. Settings → Environment Variables : ajouter `ADMIN_PASSWORD` et `ADMIN_SECRET`.
4. Redéployer. Le script `vercel-build` crée les tables et charge le référentiel avant le build.

### En ligne de commande

`scripts/deploy.sh` fait tout en une passe : projet Neon (branche `main` pour la production, branche `preview` pour les aperçus Vercel), tables et référentiel chargés sur les deux, variables d'environnement Vercel, puis mise en production.

```bash
NEON_API_KEY=... VERCEL_TOKEN=... ADMIN_PASSWORD=... ./scripts/deploy.sh
```

- `NEON_API_KEY` : console.neon.tech → Account settings → API keys.
- `VERCEL_TOKEN` : vercel.com/account/tokens. Ajouter `VERCEL_SCOPE=<slug-equipe>` si le projet doit vivre dans une équipe.
- `ADMIN_SECRET` est généré s'il est absent ; `OPENAI_API_KEY` est transmis s'il est défini.
- `PROJECT_NAME` (défaut `devis-sud-contractors`) et `NEON_REGION` (défaut `aws-eu-central-1`) sont modifiables.

Le script est rejouable : il réutilise le projet Neon et le projet Vercel s'ils existent déjà.
