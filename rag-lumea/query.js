// query.js
// Ce script interroge la base Chroma déjà vectorisée (voir ingest.js),
// récupère les chunks les plus pertinents, puis les envoie à Claude
// pour générer une réponse contextualisée dans le ton de la marque Luméa.
//
// Usage : node query.js "Quel produit convient pour une peau sensible ?"

import "dotenv/config";
import { LocalEmbeddings } from "./embeddings.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import Anthropic from "@anthropic-ai/sdk";

const COLLECTION_NAME = "lumea-knowledge-base";

const SYSTEM_PROMPT = `Tu es l'assistant service client de Luméa, une marque de skincare bio et clean beauty.
Ton rôle : répondre aux questions des client·e·s sur les produits, les routines, la livraison et les valeurs de la marque.

Règles :
- Examine attentivement CHAQUE extrait fourni dans le CONTEXTE avant de répondre — la bonne information est souvent présente mais peut se trouver dans un extrait qui n'est pas le premier.
- Réponds uniquement à partir du CONTEXTE fourni ci-dessous, jamais d'informations inventées.
- Si plusieurs produits correspondent à la question, cite-les tous plutôt qu'un seul.
- Si le contexte ne contient vraiment aucune information pertinente après avoir tout examiné, dis-le clairement et propose de contacter le service client par email.
- Ton chaleureux, professionnel, concis (3-5 phrases maximum sauf si la question demande une liste, comme une routine).
- Ne mentionne jamais que tu es un modèle de langage ou un système RAG.`;

async function askQuestion(question) {
  const embeddings = new LocalEmbeddings();

  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: COLLECTION_NAME,
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  // Récupère 10 chunks sur les 16 que compte la base (corpus volontairement
  // restreint pour ce projet) — on privilégie le recall plutôt que la précision
  // du ranking, Claude se charge ensuite de ne citer que ce qui est pertinent
  const relevantChunks = await vectorStore.similaritySearch(question, 10);

  const context = relevantChunks
    .map((chunk, i) => `[Extrait ${i + 1}]\n${chunk.pageContent}`)
    .join("\n\n");

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `CONTEXTE :\n${context}\n\nQUESTION DU CLIENT :\n${question}`,
      },
    ],
  });

  console.log("\n--- Question ---");
  console.log(question);
  console.log("\n--- Réponse Luméa ---");
  console.log(message.content[0].text);
}

const question = process.argv.slice(2).join(" ");

if (!question) {
  console.error('Usage : node query.js "ta question ici"');
  process.exit(1);
}

askQuestion(question).catch((err) => {
  console.error("Erreur durant la requête :", err);
  process.exit(1);
});
