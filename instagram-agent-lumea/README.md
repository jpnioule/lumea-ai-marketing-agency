# Agent de contenu Instagram - Luméa

Deux implémentations du même agent : un script Node.js autonome et un workflow n8n importable. Les deux utilisent les 4 produits présentés sur la landing page et dans la base de connaissances du chatbot RAG.

## Structure

```
instagram-agent-lumea/
├── agent.js          Script Node.js autonome
├── products.json     Les 4 produits Luméa (mêmes fiches que la base de connaissances du RAG)
├── package.json
└── .env.example
```

Le workflow n8n se trouve dans le dossier `n8n workflows/` à la racine du dépôt : `Luméa - Agent contenu Instagram.json`.

## Version 1 - Script Node.js

1. Installer les dépendances :
   ```
   npm install
   ```
2. Copier `.env.example` en `.env` et renseigner la clé `ANTHROPIC_API_KEY`
3. Générer un post pour un produit :
   ```
   node agent.js "Élixir Éclat Vitamine C"
   ```
   Produits disponibles : `Gel Nettoyant Purifiant Botanique`, `Brume Tonique Active à la Rose`, `Élixir Éclat Vitamine C`, `Crème Hydratante Intense`.

Le script retourne : accroche, corps de texte, call-to-action, hashtags, et un prompt de génération d'image prêt à copier dans Stability AI, Replicate, ou tout autre outil de génération d'image.

## Version 2 - Workflow n8n

1. Dans n8n : **Workflows > Import from File**, sélectionner `n8n workflows/Luméa - Agent contenu Instagram.json`
2. Configurer les credentials :
   - Node "Appel API Claude" : ajouter une credential HTTP Header Auth avec le header `x-api-key` = la clé Anthropic
   - Node "Sauvegarde dans Airtable" : connecter le compte Airtable et remplacer `REMPLACER_PAR_ID_BASE_AIRTABLE` et `REMPLACER_PAR_ID_TABLE_AIRTABLE` par les identifiants de la base et de la table
3. Le workflow :
   - Se déclenche automatiquement tous les 2 jours à 9h (modifiable dans le node de déclenchement)
   - Sélectionne le produit suivant dans la rotation des 4 produits Luméa, en changeant de produit à chaque exécution
   - Génère le post via l'API Claude
   - Parse la réponse JSON
   - Sauvegarde le résultat dans une table Airtable avec le statut "A valider" (pour une relecture humaine avant publication)

## Notes pour la présentation

- Le prompt système impose une réponse en JSON structuré, ce qui rend le parsing fiable pour l'intégration dans un workflow automatisé
- La contrainte "reste factuel" évite que l'agent invente des informations produit non vérifiées : chaque post s'appuie sur la fiche du produit (ingrédients, usage, bénéfices, précautions, prix)
- Le statut "A valider" dans Airtable illustre une bonne pratique : garder un humain dans la boucle avant publication automatique
- La génération d'image n'est pas appelée automatiquement ici (seul le prompt est généré) : à connecter à Stability AI ou Replicate pour aller plus loin
