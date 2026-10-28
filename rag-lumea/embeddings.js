// embeddings.js
// Génère des embeddings localement, sans clé API, via un petit modèle
// multilingue (paraphrase-multilingual-MiniLM-L12-v2), adapté aux textes en français,
// exécuté directement dans Node grâce à @xenova/transformers.
// Le modèle est téléchargé automatiquement au premier lancement,
// puis mis en cache localement pour les exécutions suivantes.

import { pipeline } from "@xenova/transformers";

let embedderPromise = null;

function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline("feature-extraction", "Xenova/paraphrase-multilingual-MiniLM-L12-v2");
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
