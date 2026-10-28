// Compare deux modèles d'embeddings sur la recherche de passages (retrieval),
// avec le même découpage que ingest.js. Aucun appel à Claude.
import path from "path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { pipeline } from "@xenova/transformers";

const MODELS = {
  "anglais (all-MiniLM-L6-v2)": "Xenova/all-MiniLM-L6-v2",
  "multilingue (paraphrase-multilingual-MiniLM-L12-v2)": "Xenova/paraphrase-multilingual-MiniLM-L12-v2",
};

// Questions de client, et fiche(s) attendue(s) fixées avant le test
const TESTS = [
  ["Quel produit convient pour une peau sensible ?", ["gel-nettoyant-douceur", "eau-micellaire-apaisante", "serum-hydra-eclat"]],
  ["Combien de temps pour être livré ?", ["livraison-retours"]],
  ["Comment renvoyer un produit qui ne me convient pas ?", ["livraison-retours"]],
  ["J'ai la peau grasse avec des imperfections, que me conseillez-vous ?", ["masque-argile-purifiant"]],
  ["Un soin contre les cernes et les poches ?", ["contour-yeux-anti-fatigue"]],
  ["Dans quel ordre appliquer les soins le soir ?", ["routine-matin-soir"]],
  ["Vos produits sont-ils testés sur les animaux ?", ["engagement-lumea"]],
  ["Ma peau est très sèche et tiraille, quel soin choisir ?", ["baume-nuit-reparateur", "creme-jour-protectrice", "huile-seche-nourrissante"]],
  ["Quelle crème mettre le matin avant le maquillage ?", ["creme-jour-protectrice"]],
  ["Quel produit pour démaquiller en douceur ?", ["eau-micellaire-apaisante"]],
];

const loader = new DirectoryLoader(path.resolve("./data"), { ".txt": (f) => new TextLoader(f) });
const chunks = await new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 })
  .splitDocuments(await loader.load());
const docName = (c) => path.basename(c.metadata.source, ".txt");

const results = {};
for (const [label, id] of Object.entries(MODELS)) {
  const embed = await pipeline("feature-extraction", id);
  const vec = async (t) => Array.from((await embed(t, { pooling: "mean", normalize: true })).data);
  const chunkVecs = [];
  for (const c of chunks) chunkVecs.push(await vec(c.pageContent));
  const rows = [];
  for (const [q, expected] of TESTS) {
    const qv = await vec(q);
    const ranked = chunkVecs
      .map((v, i) => ({ i, score: v.reduce((s, x, k) => s + x * qv[k], 0) }))
      .sort((a, b) => b.score - a.score)
      .map((r) => docName(chunks[r.i]));
    const rank = ranked.findIndex((d) => expected.includes(d)) + 1; // rang du 1er passage pertinent
    rows.push({ q, rank, top1: ranked[0] });
  }
  results[label] = rows;
}

const labels = Object.keys(results);
console.log(`${chunks.length} extraits indexés, ${TESTS.length} questions.\n`);
TESTS.forEach(([q], i) => {
  console.log(q);
  for (const l of labels) {
    const r = results[l][i];
    console.log(`   ${l.split(" ")[0].padEnd(11)} rang du 1er bon passage : ${r.rank}   (1er résultat : ${r.top1})`);
  }
});
console.log("\nSynthèse");
for (const l of labels) {
  const rows = results[l];
  const top1 = rows.filter((r) => r.rank === 1).length;
  const top3 = rows.filter((r) => r.rank <= 3).length;
  const mrr = rows.reduce((s, r) => s + 1 / r.rank, 0) / rows.length;
  console.log(`   ${l}\n      bon passage en 1re position : ${top1}/${rows.length}   dans le top 3 : ${top3}/${rows.length}   MRR : ${mrr.toFixed(2)}`);
}
