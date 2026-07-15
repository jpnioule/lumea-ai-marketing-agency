# Agent de contenu Instagram - Luméa

Deux implémentations du même agent : un script Node.js autonome et un workflow n8n importable.

## Structure

```
instagram-agent-lumea/
├── agent.js                              Script Node.js autonome
├── products.json                         Base des 8 produits Luméa
├── n8n-workflow-instagram-agent.json     Workflow n8n prêt à importer
├── package.json
└── .env.example
```

## Version 1 - Script Node.js

1. Installer les dépendances :
   ```
   npm install
   ```
2. Copier `.env.example` en `.env` et renseigner ta clé `ANTHROPIC_API_KEY`
3. Générer un post pour un produit :
   ```
   node agent.js "Sérum Hydra-Éclat"
   ```

Le script retourne : accroche, corps de texte, call-to-action, hashtags, et un prompt de génération d'image prêt à copier dans Stability AI, Replicate, ou tout autre outil de génération d'image.

## Version 2 - Workflow n8n

1. Dans n8n : **Workflows > Import from File**, sélectionner `n8n-workflow-instagram-agent.json`
2. Configurer les credentials :
   - Node "Appel API Claude" : ajouter une credential HTTP Header Auth avec le header `x-api-key` = ta clé Anthropic
   - Node "Sauvegarde dans Airtable" : connecter ton compte Airtable et remplacer `REMPLACER_PAR_ID_BASE_AIRTABLE` par l'ID de ta base
3. Le workflow :
   - Se déclenche automatiquement tous les 2 jours à 9h (modifiable dans le node de déclenchement)
   - Sélectionne un produit dans la rotation des 8 produits Luméa
   - Génère le post via l'API Claude
   - Parse la réponse JSON
   - Sauvegarde le résultat dans une table Airtable avec le statut "A valider" (pour une relecture humaine avant publication)

## Notes pour la présentation

- Le prompt système impose une réponse en JSON structuré, ce qui rend le parsing fiable pour l'intégration dans un workflow automatisé
- La contrainte "reste factuel" évite que l'agent invente des informations produit non vérifiées
- Le statut "A valider" dans Airtable illustre une bonne pratique : garder un humain dans la boucle avant publication automatique
- La génération d'image n'est pas appelée automatiquement ici (seul le prompt est généré) — à connecter à Stability AI ou Replicate si tu veux aller plus loin
