# AI Marketing Agency — Luméa

Écosystème marketing automatisé par l'IA générative, conçu pour **Luméa**, marque fictive de cosmétiques bio. Projet réalisé dans le cadre du Master 2 Data Marketing (INSEEC), année 2025-2026.

Le principe : simuler une agence marketing de 100% pilotée par l'IA, capable de gérer le service client, la création de contenu et les campagnes de relance, sans intervention manuelle sur les tâches répétitives.


## Le projet en un coup d'œil

| Composant | Rôle | Dossier |
|---|---|---|
| Chatbot RAG | Service client et FAQ produits | `rag-chatbot/` |
| Agent Instagram | Génération automatique de posts | `instagram-agent/` |
| Workflow n8n — Nurturing email | Relance des leads sur 14 jours | `n8n-workflows/` |
| Landing page | Capture de leads, vitrine de la marque | `landing-page/` |
| Documentation | Architecture, pitch deck | `docs/` |

## Architecture

### 1. Chatbot RAG — Service client

Base de connaissances construite à partir de fiches produits et de FAQ (engagement de la marque, livraison/retours, routine matin/soir). Le pipeline fonctionne en deux temps :

- `ingest.js` découpe et charge les documents, `embeddings.js` génère les vecteurs et les stocke dans Chroma.
- `query.js` récupère les passages pertinents et les injecte dans le prompt envoyé au LLM pour générer une réponse contextualisée.

Stack : Node.js, LangChain.js, Chroma (vector store).

### 2. Agent Instagram — Création de contenu

Workflow n8n déclenché toutes les 48h à 9h :

1. Sélection du produit du jour (rotation sur le catalogue).
2. Appel à l'API Claude pour générer la légende et le brief visuel du post.
3. Parsing de la réponse du modèle.
4. Sauvegarde dans une file d'attente Airtable, en attente de validation avant publication.

Stack : Node.js, n8n, API Anthropic (Claude), Airtable.

### 3. Workflow n8n — Nurturing email

Séquence de 5 emails déclenchée à la soumission du formulaire de la landing page :

1. Webhook reçoit le lead → enregistrement dans Airtable → Email 1 (bienvenue).
2. À J+2, J+5, J+9 et J+14 : envoi des emails 2 à 5 (focus produit, preuve sociale, code promo, dernière relance).
3. Avant chaque envoi, un nœud vérifie dans Airtable si le lead a déjà acheté. Si oui, le lead sort de la séquence (statut "converti") ; sinon la séquence continue.
4. À la fin de la séquence, le statut du lead est mis à jour.

Stack : n8n, Airtable.

### 4. Landing page

Page de présentation de Luméa avec formulaire de capture de leads (branché sur le webhook n8n ci-dessus) et intégration du chatbot RAG.

## Stack technique

- Node.js
- LangChain.js + Chroma (RAG)
- API Anthropic (Claude)
- n8n (cloud)
- Airtable
- PptxGenJS (pitch deck et supports de présentation)

## Structure du repo

```
ai-marketing-agency-lumea/
├── rag-chatbot/
│   ├── data/
│   │   ├── faq/
│   │   │   ├── engagement-lumea.txt
│   │   │   ├── livraison-retours.txt
│   │   │   └── routine-matin-soir.txt
│   │   └── produits/
│   ├── ingest.js
│   ├── embeddings.js
│   ├── query.js
│   ├── .env.example
│   └── README.md
├── instagram-agent/
│   ├── agent.js
│   ├── n8n-workflow-instagram.json
│   ├── products.json
│   ├── .env.example
│   └── README.md
├── n8n-workflows/
│   └── email-nurturing.json
├── landing-page/
└── docs/
    └── pitch-deck.pptx
```

## Installation

Chaque sous-dossier a ses propres dépendances.

**Chatbot RAG**
```bash
cd rag-chatbot
npm install
cp .env.example .env   # renseigner la clé API et les infos Chroma
node ingest.js         # charge les documents et génère les embeddings
node query.js           # lance une requête de test
```

**Agent Instagram**
```bash
cd instagram-agent
npm install
cp .env.example .env   # renseigner la clé API Claude et les identifiants Airtable
node agent.js
```

**Workflows n8n**

Importer les fichiers `.json` du dossier `n8n-workflows/` (et `instagram-agent/n8n-workflow-instagram.json`) dans une instance n8n via *Import from File*, puis reconfigurer les credentials (Airtable, API Claude).

## Cadre pédagogique

Projet réalisé dans le cadre du cours "AI Marketing Agency" du Master 2 Data Marketing, mobilisant les compétences LLM, prompt engineering, architecture RAG, agents IA et automatisation n8n vues en cours.
