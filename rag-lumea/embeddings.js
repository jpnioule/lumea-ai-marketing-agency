// embeddings.js
// Génère des embeddings localement, sans clé API, via un petit modèle
// (all-MiniLM-L6-v2) exécuté directement dans Node grâce à @xenova/transformers.
// Le modèle (~90 Mo) est téléchargé automatiquement au premier lancement,
// puis mis en cache localement pour les exécutions suivantes.

import { pipeline } from "@xenova/transformers";

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return embedderPromise;
}

export class LocalEmbeddings {
  async embedDocuments(texts) {
    const model = await getEmbedder();
    const vectors = [];
    for (const text of texts) {
      const output = await model(text, { pooling: "mean", normalize: true });
      vectors.push(Array.from(output.data));
    }
    return vectors;
  }

  async embedQuery(text) {
    const [vector] = await this.embedDocuments([text]);
    return vector;
  }
}
