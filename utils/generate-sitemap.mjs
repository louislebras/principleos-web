// utils/generate-sitemap.mjs

import fs from "fs";
import path from "path";
import xml from "xml";
import { baseUrl } from "../config/config-app.js"; // Import de baseUrl

// 📂 Dossier contenant les pages générées
const pagesDir = path.join(process.cwd(), "dist");

// 🔄 Fonction pour parcourir les fichiers de manière récursive
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else if (file === "index.html") {
      const relativePath = filePath.replace(pagesDir, "").replace(/\\/g, "/");
      fileList.push(relativePath);
    }
  });

  return fileList;
}

// 🔍 Récupérer tous les fichiers index.html
const files = getFiles(pagesDir);

// 🌍 Détecter les langues présentes en comparant les structures
const rootStructure = new Set();
const languages = new Set();

files.forEach((file) => {
  const parts = file.split("/").filter(Boolean);

  if (parts.length === 1) {
    rootStructure.add(parts[0]); // Ajouter les pages de la racine
  } else if (!rootStructure.has(parts[0])) {
    languages.add(parts[0]); // Ajouter comme langue détectée si la structure est similaire
  }
});

// 🔗 Générer les URLs des pages avec les bonnes priorités
const urlSet = new Set(); // Évite les doublons
const urls = [];

files.forEach((file) => {
  const route = file.replace("/index.html", ""); // Supprimer "index.html"
  const fullUrl = `${baseUrl}${route}`; // Utilisation de baseUrl importé

  if (!urlSet.has(fullUrl)) {
    urlSet.add(fullUrl);

    // Détecter si c'est une langue
    const parts = route.split("/").filter(Boolean);
    const isLang = parts.length > 0 && languages.has(parts[0]);

    // Déterminer la priorité en fonction de la structure
    let priority;
    if (parts.length === 0 || (parts.length === 1 && isLang)) {
      priority = 1.0; // Home principale et langues
    } else if (parts.length === 1 || (parts.length === 2 && isLang)) {
      priority = 0.9; // Pages secondaires
    } else {
      priority = 0.8; // Pages en sous-dossiers
    }

    urls.push({
      loc: fullUrl,
      changefreq: "weekly",
      priority: priority,
      lastmod: new Date().toISOString(),
    });
  }
});

// 🔢 Trier les URLs par priorité décroissante et ordre alphabétique
urls.sort((a, b) => {
  if (b.priority !== a.priority) {
    return b.priority - a.priority;
  }
  return a.loc.localeCompare(b.loc);
});

// 📜 Générer le fichier sitemap.xml en format XML propre
const sitemap = xml(
  [
    {
      urlset: [
        { _attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" } },
        ...urls.map((url) => ({
          url: [
            { loc: url.loc },
            { changefreq: url.changefreq },
            { priority: url.priority.toFixed(1) },
            { lastmod: url.lastmod },
          ],
        })),
      ],
    },
  ],
  { declaration: true }
);

// 💾 Sauvegarder le fichier sitemap.xml
fs.writeFileSync("sitemap.xml", sitemap);

console.log(
  "✅ Sitemap généré avec succès, bien structuré avec détection automatique des langues !"
);
