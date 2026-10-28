# Chatbot RAG - Luméa

Base de connaissances vectorisée pour le chatbot service client de Luméa (AI Marketing Agency).

## Structure

```
rag-lumea/
├── data/
│   ├── produits/     8 fiches produits de la gamme Luméa
│   └── faq/          Routine, livraison/retours, engagement de la marque
├── ingest.js         Vectorise les documents dans Chroma
├── query.js          Interroge le chatbot (retrieval + génération)
├── package.json
└── .env.example
```

## Installation

1. Installer les dépendances :
   ```
   npm install --legacy-peer-deps
   ```
   (`--legacy-peer-deps` contourne un conflit de versions connu entre les paquets LangChain)

2. Copier `.env.example` en `.env` et renseigner ta clé API :
   ```
   cp .env.example .env
   ```
   - `ANTHROPIC_API_KEY` : utilisée pour générer les réponses avec Claude
   - Les embeddings sont générés **localement et gratuitement** via `@xenova/transformers`
     (modèle multilingue `paraphrase-multilingual-MiniLM-L12-v2`, adapté au français, téléchargé automatiquement au premier lancement) —
     aucune clé OpenAI n'est nécessaire

3. Lancer un serveur Chroma en local (nécessite Python) :
   ```
   pip install chromadb --break-system-packages
   chroma run --host localhost --port 8000
   ```
   Le projet utilise le client JavaScript `chromadb` 3.x, compatible avec les serveurs Chroma 1.x.
   Laisser ce terminal ouvert.

## Utilisation

Dans un autre terminal :

1. Vectoriser la base de connaissances (à faire une fois, ou à chaque modification des fichiers dans `/data`) :
   ```
   npm run ingest
   ```

2. Poser une question au chatbot :
   ```
   node query.js "Quel produit convient pour une peau sensible ?"
   ```

3. Évaluer la recherche de passages (comparaison des modèles d'embeddings, sans appel à Claude) :
   ```
   npm run evaluate
   ```

## Pour la démo / présentation

- Le chatbot répond uniquement à partir des documents dans `/data` (pas d'invention)
- Pour ajouter un produit ou une info, il suffit d'ajouter un fichier `.txt` dans `data/produits/` ou `data/faq/` et de relancer `npm run ingest`
- Pour une interface web de démo, ce script `query.js` peut être exposé via une petite API Express, appelée depuis la landing page (vibe coding)
