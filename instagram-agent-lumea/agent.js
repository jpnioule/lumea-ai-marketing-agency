// agent.js
// Agent de création de contenu Instagram pour Luméa.
// Reçoit le nom d'un produit, génère une légende structurée (accroche,
// corps, CTA, hashtags) et un prompt de génération d'image cohérent
// avec l'identité visuelle de la marque.
//
// Usage : node agent.js "Sérum Hydra-Éclat"

import "dotenv/config";
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

const PRODUCTS_PATH = path.resolve("./products.json");

const SYSTEM_PROMPT = `Tu es le social media manager de Luméa, marque de skincare bio et clean beauty.
Ton : chaleureux, inspirant, jamais commercial ou agressif.
Cible : femmes/hommes 25-40 ans, sensibles à la clean beauty.

Contrainte stricte : reste factuel sur le produit, utilise uniquement les informations fournies dans le CONTEXTE PRODUIT ci-dessous. N'invente aucune information (ingrédient, prix, usage) qui n'y figure pas.

Réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown, au format exact suivant :
{
  "accroche": "une ligne courte et percutante",
  "corps": "3-4 phrases informatives ou inspirantes sur le produit",
  "cta": "un call-to-action doux, jamais 'achetez maintenant'",
  "hashtags": ["#exemple1", "#exemple2"],
  "promptImage": "un prompt de génération d'image en anglais, style photo produit minimaliste clean beauty"
}`;

async function generatePost(productName) {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));
  const product = products.find(
    (p) => p.nom.toLowerCase() === productName.toLowerCase()
  );

  if (!product) {
    console.error(
      `Produit "${productName}" introuvable. Produits disponibles : ${products
        .map((p) => p.nom)
        .join(", ")}`
    );
    process.exit(1);
  }

  const contextProduit = `
Nom : ${product.nom}
Catégorie : ${product.categorie}
Type de peau : ${product.typePeau}
Ingrédients clés : ${product.ingredientsCles}
Usage : ${product.usage}
Prix : ${product.prix}
Particularité : ${product.particularite}
`;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `CONTEXTE PRODUIT :\n${contextProduit}\n\nGénère le post Instagram pour ce produit.`,
      },
    ],
  });

  const rawText = message.content[0].text.trim();

  let post;
  try {
    post = JSON.parse(rawText);
  } catch (err) {
    console.error("Erreur de parsing JSON, réponse brute reçue :");
    console.error(rawText);
    process.exit(1);
  }

  console.log("\n=== Post Instagram généré ===\n");
  console.log(`Produit : ${product.nom}\n`);
  console.log(`Accroche : ${post.accroche}`);
  console.log(`\nCorps :\n${post.corps}`);
  console.log(`\nCTA : ${post.cta}`);
  console.log(`\nHashtags : ${post.hashtags.join(" ")}`);
  console.log(`\nPrompt image (à utiliser dans Stability AI / Replicate) :`);
  console.log(post.promptImage);

  return post;
}

const productName = process.argv.slice(2).join(" ");

if (!productName) {
  console.error('Usage : node agent.js "Nom du produit"');
  process.exit(1);
}

generatePost(productName).catch((err) => {
  console.error("Erreur durant la génération :", err);
  process.exit(1);
});
