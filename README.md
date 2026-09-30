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
