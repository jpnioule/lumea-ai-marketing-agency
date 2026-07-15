// ingest.js
// Ce script lit tous les documents du dossier /data, les découpe en chunks,
// les vectorise (embeddings) et les stocke dans une base Chroma locale.
//
// Prérequis : avoir un serveur Chroma qui tourne en local
//   -> pip install chromadb --break-system-packages
//   -> chroma run --host localhost --port 8000
//
// Puis lancer : npm run ingest

import "dotenv/config";
import fs from "fs";
import path from "path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { LocalEmbeddings } from "./embeddings.js";
import { Chroma } from "@langchain/community/vectorstores/chroma";

const DATA_DIR = path.resolve("./data");
const COLLECTION_NAME = "lumea-knowledge-base";

async function main() {
  console.log("Lecture des documents dans /data ...");

  // Charge tous les fichiers .txt du dossier data (produits + faq)
  const loader = new DirectoryLoader(DATA_DIR, {
    ".txt": (filePath) => new TextLoader(filePath),
  });
  const rawDocs = await loader.load();
  console.log(`${rawDocs.length} documents trouvés.`);

  // Découpe chaque document en chunks (taille adaptée à des fiches courtes)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitDocuments(rawDocs);
  console.log(`${chunks.length} chunks générés après découpage.`);

  // Ajoute une métadonnée de catégorie basée sur le nom du dossier parent
  // (produits vs faq) pour permettre un filtrage plus tard si besoin
  chunks.forEach((chunk) => {
    const sourcePath = chunk.metadata.source || "";
    chunk.metadata.category = sourcePath.includes("/produits/")
      ? "produit"
      : "faq";
  });

  console.log("Génération des embeddings (locaux) et stockage dans Chroma ...");
  console.log("(premier lancement : le modèle ~90 Mo se télécharge automatiquement)");
  const embeddings = new LocalEmbeddings();

  await Chroma.fromDocuments(chunks, embeddings, {
    collectionName: COLLECTION_NAME,
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  console.log(
    `Ingestion terminée. Collection "${COLLECTION_NAME}" prête à être interrogée.`
  );
}

main().catch((err) => {
  console.error("Erreur durant l'ingestion :", err);
  process.exit(1);
});
