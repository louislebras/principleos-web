// import fs from "fs";
// import path from "path";
// import { JSDOM } from "jsdom";
// import { glob } from "glob";
// import { pathToFileURL } from "url";
// import { exec } from "child_process";
// import { promisify } from "util";
// import {
//   baseUrl,
//   availableLanguages,
//   isDefaultLanguage,
//   prependLangSlug,
// } from "../config/config-app.js"; // Import des fonctions de gestion des langues

// // Fonction pour mettre à jour router.js avec la liste des langues
// async function updateRouterLanguages() {
//   try {
//     // 1. Lire config/languages.js
//     const languagesPath = path.resolve("config/config-app.js");
//     const languagesContent = fs.readFileSync(languagesPath, "utf8");

//     // Extraire availableLanguages en utilisant une expression régulière
//     const availableLanguagesMatch = languagesContent.match(
//       /availableLanguages\s*=\s*\[(.*?)\]/
//     );
//     if (!availableLanguagesMatch) {
//       throw new Error(
//         "Impossible de trouver availableLanguages dans config/config-app.js"
//       );
//     }

//     // Extraire la liste des langues (en enlevant les guillemets et les espaces)
//     const languagesArray = availableLanguagesMatch[1]
//       .split(",")
//       .map((lang) => lang.trim().replace(/['"]/g, ""));

//     // 2. Lire le contenu actuel de router.js
//     const routerPath = path.resolve("js/router.js");
//     let routerContent = fs.readFileSync(routerPath, "utf8");

//     // 3. Remplacer la ligne de availableLanguages dans router.js
//     const newLanguagesLine = `const availableLanguages = ${JSON.stringify(
//       languagesArray
//     )};`;
//     const languagesRegex = /const availableLanguages = \[.*?\];/;
//     if (!languagesRegex.test(routerContent)) {
//       throw new Error(
//         "Impossible de trouver la ligne de availableLanguages dans router.js"
//       );
//     }

//     routerContent = routerContent.replace(languagesRegex, newLanguagesLine);

//     // 4. Écrire le nouveau contenu dans router.js
//     fs.writeFileSync(routerPath, routerContent, "utf8");
//     console.log(
//       "✅ router.js a été mis à jour avec la liste des langues :",
//       languagesArray
//     );
//   } catch (err) {
//     console.error(
//       "❌ Erreur lors de la mise à jour de router.js :",
//       err.message
//     );
//   }
// }

// const DIST_PATH = path.resolve("dist");
// const APP_PATH = path.resolve("app");
// const LOCALES_PATH = path.resolve("content");
// const COMPONENTS_PATH = path.resolve("frames"); // Préservé, ne pas toucher
// const BASE_HTML = path.resolve("server/base.html");
// const DESIGN_SYSTEM_PATH = path.resolve("design-system");
// const DESIGN_SYSTEM_COMPONENTS_PATH = path.join(
//   DESIGN_SYSTEM_PATH,
//   "components"
// );
// const DESIGN_SYSTEM_LAYOUTS_PATH = path.join(DESIGN_SYSTEM_PATH, "layouts");
// const DESIGN_SYSTEM_TEMPLATES_PATH = path.join(DESIGN_SYSTEM_PATH, "templates");
// const ICONS_PATH = path.join(DESIGN_SYSTEM_PATH, "icons"); // Ajout du chemin pour icons
// const SCSS_PATH = path.resolve("scss");
// const ALL_SCSS_SOURCE = path.join(DESIGN_SYSTEM_PATH, "all.scss");
// const ALL_SCSS_DEST = path.join(SCSS_PATH, "all.scss");
// const execAsync = promisify(exec);

// // Maps pour associer les classes des éléments du design system à leurs répertoires
// const designSystemComponentClassToDir = new Map();
// const designSystemLayoutClassToDir = new Map();
// const designSystemTemplateClassToDir = new Map();
// const iconClassToAttributes = new Map(); // Nouveau mapping pour les icônes

// function stripGroupsFromPath(filePath) {
//   return filePath.replace(/\(.*?\)\//g, ""); // Supprime tous les groupes des chemins
// }

// // Collecter les noms de classes des composants, layouts, templates et icônes du design system
// function collectDesignSystemClassNames() {
//   // Collecter les composants
//   const componentFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_COMPONENTS_PATH,
//   });
//   componentFiles.forEach((file) => {
//     const componentDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_COMPONENTS_PATH,
//       componentDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemComponentClassToDir.set(rootElement.className, componentDir);
//     }
//   });

//   // Collecter les layouts
//   const layoutFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_LAYOUTS_PATH,
//   });
//   layoutFiles.forEach((file) => {
//     const layoutDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_LAYOUTS_PATH,
//       layoutDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemLayoutClassToDir.set(rootElement.className, layoutDir);
//     }
//   });

//   // Collecter les templates
//   const templateFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_TEMPLATES_PATH,
//   });
//   templateFiles.forEach((file) => {
//     const templateDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_TEMPLATES_PATH,
//       templateDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemTemplateClassToDir.set(rootElement.className, templateDir);
//     }
//   });

//   // Collecter les icônes
//   const iconsIndexPath = path.join(ICONS_PATH, "index.html");
//   if (fs.existsSync(iconsIndexPath)) {
//     const html = fs.readFileSync(iconsIndexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const iconElements = document.querySelectorAll(".icon-library img");
//     iconElements.forEach((img) => {
//       const className = img.className;
//       const src = img.getAttribute("src");
//       const alt = img.getAttribute("alt");
//       if (className && src && alt) {
//         iconClassToAttributes.set(className, { src, alt });
//       }
//     });
//   }

//   console.log(
//     "Design System Component class-to-directory mapping:",
//     Object.fromEntries(designSystemComponentClassToDir)
//   );
//   console.log(
//     "Design System Layout class-to-directory mapping:",
//     Object.fromEntries(designSystemLayoutClassToDir)
//   );
//   console.log(
//     "Design System Template class-to-directory mapping:",
//     Object.fromEntries(designSystemTemplateClassToDir)
//   );
//   console.log(
//     "Icon class-to-attributes mapping:",
//     Object.fromEntries(iconClassToAttributes)
//   );
// }

// // Nettoie dist avant chaque build
// function cleanDist() {
//   if (fs.existsSync(DIST_PATH)) {
//     fs.rmSync(DIST_PATH, { recursive: true, force: true });
//     console.log("✅ Cleaned up previous dist folder.");
//   }
//   // 🔥 Supprime les dossiers de groupes (juste au cas où)
//   const groupFolders = glob.sync(`${DIST_PATH}/(*/`);
//   groupFolders.forEach((folder) =>
//     fs.rmSync(folder, { recursive: true, force: true })
//   );
// }

// function resolveFilePath(filePath) {
//   // Vérifie si le fichier existe directement
//   if (fs.existsSync(path.join(APP_PATH, filePath, "index.html"))) {
//     return path.join(APP_PATH, filePath);
//   }

//   // Recherche dans les dossiers de groupes (dossiers entre parenthèses)
//   const parentFolders = glob.sync(`*/${filePath}`, { cwd: APP_PATH });

//   for (const folder of parentFolders) {
//     if (fs.existsSync(path.join(APP_PATH, folder, "index.html"))) {
//       return path.join(APP_PATH, folder);
//     }
//   }

//   return null;
// }

// // Copie un dossier source → destination
// function copyFolder(source, destination) {
//   if (fs.existsSync(source)) {
//     fs.mkdirSync(destination, { recursive: true });
//     fs.cpSync(source, destination, { recursive: true });
//     console.log(`Copied ${source} to ${destination}.`);
//   } else {
//     console.log(`Folder ${source} does not exist, skipping.`);
//   }
// }

// // Fonction pour générer all.scss en concaténant le contenu de tous les fichiers *.scss du dossier design-system
// function copyAllScss() {
//   console.log(
//     "Génération de all.scss en concaténant le contenu des fichiers *.scss du dossier design-system..."
//   );

//   // Trouver tous les fichiers *.scss dans le dossier design-system (y compris sous-dossiers)
//   const scssFiles = glob.sync("**/*.scss", { cwd: DESIGN_SYSTEM_PATH });

//   if (scssFiles.length === 0) {
//     console.error(
//       `Erreur : Aucun fichier *.scss trouvé dans ${DESIGN_SYSTEM_PATH}.`
//     );
//     throw new Error("Aucun fichier SCSS trouvé dans design-system");
//   }

//   // Prioriser les fichiers susceptibles de contenir des définitions de variables
//   const priorityFiles = [
//     "variables.scss",
//     "colors.scss",
//     "typography.scss",
//     "base.scss",
//   ];
//   const prioritizedFiles = [];
//   const remainingFiles = [];

//   // Séparer les fichiers prioritaires des autres
//   scssFiles.forEach((file) => {
//     const fileName = path.basename(file);
//     if (priorityFiles.includes(fileName)) {
//       prioritizedFiles.push(file);
//     } else {
//       remainingFiles.push(file);
//     }
//   });

//   // Trier les fichiers prioritaires pour respecter l'ordre : variables.scss, colors.scss, typography.scss, base.scss
//   prioritizedFiles.sort((a, b) => {
//     const aIndex = priorityFiles.indexOf(path.basename(a));
//     const bIndex = priorityFiles.indexOf(path.basename(b));
//     return aIndex - bIndex;
//   });

//   // Combiner les fichiers : d'abord les prioritaires, puis les autres
//   const orderedFiles = [...prioritizedFiles, ...remainingFiles];

//   // Créer le dossier scss s'il n'existe pas
//   if (!fs.existsSync(SCSS_PATH)) {
//     fs.mkdirSync(SCSS_PATH, { recursive: true });
//     console.log(`Dossier créé : ${SCSS_PATH}`);
//   }

//   // Générer le contenu de all.scss en concaténant le contenu de chaque fichier SCSS
//   const allScssContent = orderedFiles
//     .map((file) => {
//       const filePath = path.join(DESIGN_SYSTEM_PATH, file);
//       const scssContent = fs.readFileSync(filePath, "utf8").trim();
//       console.log(`Ajouté contenu SCSS de : ${filePath}`);
//       return scssContent;
//     })
//     .filter((content) => content) // Ignorer les fichiers vides
//     .join("\n\n");

//   // Écrire le fichier all.scss dans le dossier scss
//   fs.writeFileSync(ALL_SCSS_DEST, allScssContent, "utf8");
//   console.log(
//     `Généré : ${ALL_SCSS_DEST} avec ${orderedFiles.length} fichiers SCSS concaténés`
//   );
// }

// function readJSON(filePath) {
//   return JSON.parse(fs.readFileSync(filePath, "utf8"));
// }

// // Remplace les {{clé}} par leur traduction… si elle existe.
// function replacePlaceholders(template, translations) {
//   return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
//     if (translations[key] !== undefined) {
//       return translations[key];
//     }
//     return `{{${key}}}`;
//   });
// }

// function calculateDirectoryBasePath(outputPath) {
//   const depth =
//     path.dirname(outputPath).split(path.sep).length -
//     DIST_PATH.split(path.sep).length;
//   return "../".repeat(Math.max(0, depth));
// }

// function adjustLinks(html, outputPath, lang) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);

//   // Remplacer [ROOT] dans tous les cas
//   let adjustedHtml = html.replace(/\[ROOT\]/g, directoryBasePath);

//   // Modifier les href uniquement s'ils contiennent [ROOT] ou ont été modifiés pour contenir directoryBasePath
//   adjustedHtml = adjustedHtml.replace(/href="(.*?)"/g, (match, href) => {
//     // Ne pas modifier les URLs absolues (http:// ou https://) sauf si elles contiennent [ROOT]
//     if (
//       /^https?:\/\//i.test(href) &&
//       !href.includes("[ROOT]") &&
//       !href.includes(directoryBasePath)
//     ) {
//       return match;
//     }

//     // Ne modifier que si l'URL contient directoryBasePath (après remplacement de [ROOT])
//     if (href.includes(directoryBasePath)) {
//       if (href.startsWith("/")) {
//         const adjustedHref = prependLangSlug(href, lang); // Appel avec seulement href et lang
//         return `href="${adjustedHref}"`;
//       }
//       if (!isDefaultLanguage(lang)) {
//         return `href="${directoryBasePath}${lang}/${href.replace(
//           directoryBasePath,
//           ""
//         )}"`;
//       }
//     }

//     return match;
//   });

//   // Nettoyer les doubles slashes
//   adjustedHtml = adjustedHtml.replace(/([^:])\/\//g, "$1/");

//   return adjustedHtml;
// }

// function adjustMediaLinks(html, outputPath) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);
//   const dom = new JSDOM(html);
//   const document = dom.window.document;

//   document.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
//     let href = link.getAttribute("href");
//     if (href && (href.includes("[ROOT]") || href.includes(directoryBasePath))) {
//       href = href.replace(/\/[a-z]{2}\//, "/");
//       href = href.replace("[ROOT]", directoryBasePath);
//       href = href.replace(/([^:]\/)\/+/g, "$1");
//       link.setAttribute("href", href);
//     }
//   });

//   document.querySelectorAll("img[src]").forEach((img) => {
//     let src = img.getAttribute("src");
//     if (src && (src.includes("[ROOT]") || src.includes(directoryBasePath))) {
//       src = src.replace(/\/[a-z]{2}\//, "/");
//       src = src.replace("[ROOT]", directoryBasePath);
//       src = src.replace(/([^:]\/)\/+/g, "$1");
//       img.setAttribute("src", src);
//     }
//   });

//   return dom.serialize();
// }

// function adjustScriptLinks(html, outputPath) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);
//   const dom = new JSDOM(html);
//   const document = dom.window.document;

//   document.querySelectorAll("script[src]").forEach((script) => {
//     let src = script.getAttribute("src");
//     if (src && src.includes("[ROOT]")) {
//       src = src.replace("[ROOT]", directoryBasePath);
//       src = src.replace(/([^:]\/)\/+/g, "$1");
//       script.setAttribute("src", src);
//     }
//   });

//   return dom.serialize();
// }

// // Fonction modifiée pour charger les composants sans remplacement des placeholders
// function loadComponentWithoutReplace(
//   componentName,
//   lang,
//   outputPath,
//   isPrimaryLang
// ) {
//   const componentPath = path.join(COMPONENTS_PATH, componentName, "index.html");

//   if (!fs.existsSync(componentPath)) {
//     console.error(`Missing component: ${componentName}`);
//     return "";
//   }

//   const componentTemplate = fs.readFileSync(componentPath, "utf8");

//   let html = componentTemplate; // Pas de remplacement ici

//   // Traiter les éléments du design-system dans le composant
//   const dom = new JSDOM(`<div>${html}</div>`);
//   const document = dom.window.document;
//   const elements = document.querySelectorAll("*");
//   elements.forEach((element) => {
//     const newHtml = loadDesignSystemElement(
//       element,
//       lang,
//       outputPath,
//       isPrimaryLang
//     );
//     if (newHtml !== element.outerHTML) {
//       const newDom = new JSDOM(newHtml);
//       element.replaceWith(newDom.window.document.body.firstElementChild);
//     }
//   });

//   html = dom.window.document.body.firstElementChild.innerHTML;
//   html = adjustLinks(html, outputPath, lang);
//   html = adjustMediaLinks(html, outputPath);

//   return html.trim();
// }

// function loadDesignSystemElement(
//   element,
//   lang,
//   outputPath,
//   isPrimaryLang,
//   inheritedValues = {},
//   parentElement = null
// ) {
//   const classList = element.className ? element.className.split(/\s+/) : [];
//   let elementPath;
//   let matchedClass;

//   // Étape a) : Vérifier si une des classes correspond à un layout, un composant ou un template
//   for (const className of classList) {
//     if (
//       className.endsWith("-layout") &&
//       designSystemLayoutClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_LAYOUTS_PATH,
//         designSystemLayoutClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     } else if (
//       className.endsWith("-component") &&
//       designSystemComponentClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_COMPONENTS_PATH,
//         designSystemComponentClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     } else if (
//       className.endsWith("-template") &&
//       designSystemTemplateClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_TEMPLATES_PATH,
//         designSystemTemplateClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     }
//   }

//   if (elementPath && fs.existsSync(elementPath)) {
//     let elementHtml = fs.readFileSync(elementPath, "utf8");
//     const elementDom = new JSDOM(elementHtml);
//     const elementRoot = elementDom.window.document.body.firstElementChild;

//     // Étape b) : Extraire les valeurs des placeholders de l'élément de la page
//     // Utiliser une regex plus permissive pour gérer les guillemets dans les valeurs
//     const pagePlaceholders =
//       element.innerHTML.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/gs) || [];
//     const pageValues = { ...inheritedValues };

//     // console.log(
//     //   `Extracted placeholders for element ${matchedClass}:`,
//     //   pagePlaceholders
//     // );

//     pagePlaceholders.forEach((placeholder) => {
//       const match = placeholder.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/s);
//       if (match) {
//         const [, name, value] = match;
//         pageValues[name] = value;
//         console.log(`Placeholder [${name}] assigned value: ${value}`);
//       } else {
//         console.warn(`Invalid placeholder format: ${placeholder}`);
//       }
//     });

//     // Étape c) : Remplacer les placeholders dans le contenu HTML (innerHTML) de l'élément courant
//     let elementContent = elementRoot.innerHTML;
//     Object.keys(pageValues).forEach((key) => {
//       const value = pageValues[key];
//       console.log(`Replacing placeholder [${key}] with value: ${value}`);

//       // Supprimer le placeholder de définition (ex: [key]: "value";)
//       elementContent = elementContent.replace(
//         new RegExp(`\\[${key}\\]:\s*".*?"\\s*;`, "gs"),
//         ""
//       );

//       // Vérifier si la valeur contient du HTML (balises comme <br>, <span>, etc.)
//       const containsHtml = /<[a-z][\s\S]*>/i.test(value);
//       if (containsHtml) {
//         console.log(`Value for [${key}] contains HTML, inserting as raw HTML`);
//         // Si la valeur contient du HTML, l'insérer comme HTML brut
//         const tempDom = new JSDOM(`<div>${elementContent}</div>`);
//         const tempDoc = tempDom.window.document;
//         const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
//         const matches = elementContent.match(placeholderRegex);
//         if (matches) {
//           elementContent = elementContent.replace(placeholderRegex, value);
//         } else {
//           console.warn(
//             `Placeholder [${key}] not found in element content: ${elementContent}`
//           );
//         }
//       } else {
//         // Si la valeur est du texte brut, la remplacer comme avant
//         const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
//         const matches = elementContent.match(placeholderRegex);
//         if (matches) {
//           elementContent = elementContent.replace(placeholderRegex, value);
//         } else {
//           console.warn(
//             `Placeholder [${key}] not found in element content: ${elementContent}`
//           );
//         }
//       }
//     });

//     // Étape d) : Traiter récursivement les éléments enfants (layouts, composants, templates)
//     const childDom = new JSDOM(`<div>${elementContent}</div>`);
//     const childElements = childDom.window.document.querySelectorAll("*");
//     childElements.forEach((childElement) => {
//       const childClassName = childElement.className;
//       if (
//         (childClassName && childClassName.endsWith("-layout")) ||
//         (childClassName && childClassName.endsWith("-component")) ||
//         (childClassName && childClassName.endsWith("-template"))
//       ) {
//         const newChildHtml = loadDesignSystemElement(
//           childElement,
//           lang,
//           outputPath,
//           isPrimaryLang,
//           pageValues,
//           elementRoot
//         );
//         const newChildDom = new JSDOM(newChildHtml);
//         childElement.replaceWith(
//           newChildDom.window.document.body.firstElementChild
//         );
//       }
//     });

//     // Mettre à jour le contenu de l'élément avec les enfants traités
//     elementContent = childDom.window.document.body.firstElementChild.innerHTML;

//     // Étape e) : Remplacer les icônes par leurs balises complètes
//     const iconDom = new JSDOM(`<div>${elementContent}</div>`);
//     const iconElements = iconDom.window.document.querySelectorAll("img");
//     iconElements.forEach((img) => {
//       const className = img.className;
//       if (iconClassToAttributes.has(className)) {
//         const { src, alt } = iconClassToAttributes.get(className);
//         img.setAttribute("src", src);
//         img.setAttribute("alt", alt);
//       }
//     });

//     // Mettre à jour le contenu avec les icônes remplacées
//     elementContent = iconDom.window.document.body.firstElementChild.innerHTML;

//     // Étape f) : Remplacer les placeholders dans les attributs des éléments enfants
//     const finalDom = new JSDOM(`<div>${elementContent}</div>`);
//     const allElements = finalDom.window.document.querySelectorAll("*");
//     allElements.forEach((el) => {
//       Array.from(el.attributes).forEach((attr) => {
//         const attrValue = attr.value;
//         Object.keys(pageValues).forEach((key) => {
//           const value = pageValues[key];
//           if (attrValue.includes(`[${key}]`)) {
//             attr.value = attrValue.replace(
//               new RegExp(`\\[${key}\\]`, "g"),
//               value
//             );
//           }
//         });
//       });
//     });

//     // Mettre à jour le contenu avec les attributs modifiés
//     elementContent = finalDom.window.document.body.firstElementChild.innerHTML;

//     // Reconstruire l'élément avec le contenu mis à jour
//     elementRoot.innerHTML = elementContent;

//     // Étape g) : Préservez toutes les classes de l'élément original
//     elementRoot.className = element.className;

//     // Étape h) : Copier tous les autres attributs de l'élément original vers elementRoot
//     Array.from(element.attributes).forEach((attr) => {
//       if (attr.name !== "class") {
//         elementRoot.setAttribute(attr.name, attr.value);
//       }
//     });

//     // Étape i) : Remplacer les placeholders dans les attributs de elementRoot lui-même
//     Array.from(elementRoot.attributes).forEach((attr) => {
//       const attrValue = attr.value;
//       Object.keys(pageValues).forEach((key) => {
//         const value = pageValues[key];
//         if (attrValue.includes(`[${key}]`)) {
//           attr.value = attrValue.replace(
//             new RegExp(`\\[${key}\\]`, "g"),
//             value
//           );
//         }
//       });
//     });

//     // Étape j) : Si l'élément chargé est une balise différente (par exemple, <button> remplacé par <a>),
//     // copier les attributs de la balise parent (si fournie)
//     if (
//       parentElement &&
//       elementRoot.tagName.toLowerCase() !== element.tagName.toLowerCase()
//     ) {
//       Array.from(parentElement.attributes).forEach((attr) => {
//         if (attr.name !== "class") {
//           elementRoot.setAttribute(attr.name, attr.value);
//         }
//       });
//     }

//     // Ajuster les liens et médias dans l'élément chargé
//     let adjustedHtml = adjustLinks(elementRoot.outerHTML, outputPath, lang);
//     adjustedHtml = adjustMediaLinks(adjustedHtml, outputPath);

//     return adjustedHtml;
//   }

//   return element.outerHTML;
// }

// function findLayout(filePath) {
//   const localLayoutPath = path.join(APP_PATH, filePath, "layout.js");
//   if (fs.existsSync(localLayoutPath)) {
//     return localLayoutPath;
//   }
//   let currentPath = path.dirname(path.join(APP_PATH, filePath));

//   while (currentPath !== APP_PATH) {
//     const layoutPath = path.join(currentPath, "layout.js");
//     if (fs.existsSync(layoutPath)) {
//       return layoutPath;
//     }
//     currentPath = path.dirname(currentPath);
//   }
//   const rootLayoutPath = path.join(APP_PATH, "layout.js");
//   return fs.existsSync(rootLayoutPath) ? rootLayoutPath : null;
// }

// async function generatePage(filePath, lang, isPrimaryLang = false) {
//   const baseHTML = fs.readFileSync(BASE_HTML, "utf8");

//   const normalizedPath = stripGroupsFromPath(filePath);
//   const resolvedPath = resolveFilePath(normalizedPath);
//   if (!resolvedPath) {
//     console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
//     return;
//   }

//   const metaPath = path.join(resolvedPath, "meta.html");
//   const contentPath = path.join(resolvedPath, "index.html");

//   if (!fs.existsSync(contentPath)) {
//     console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
//     return;
//   }

//   let localePath = path.join(
//     LOCALES_PATH,
//     "pages",
//     normalizedPath,
//     `${lang}.json`
//   );
//   if (!fs.existsSync(localePath)) {
//     console.warn(
//       `⚠️ Avertissement : Pas de traduction trouvée pour ${filePath} en ${lang}`
//     );
//     localePath = null;
//   }

//   let metaContent = fs.existsSync(metaPath)
//     ? fs.readFileSync(metaPath, "utf8").trim()
//     : "";
//   let pageContent = fs.readFileSync(contentPath, "utf8").trim();

//   // Pas de remplacement des placeholders ici, on le fera après l'assemblage

//   const cleanFilePath = stripGroupsFromPath(filePath);
//   const localizedUrl = isPrimaryLang
//     ? `${baseUrl}/${cleanFilePath === "index" ? "" : cleanFilePath}`
//     : `${baseUrl}/${lang}/${cleanFilePath === "index" ? "" : cleanFilePath}`;

//   // Remplacements manuels pour {{og:url}} (pas des placeholders i18n standards)
//   metaContent = metaContent.replace(/\{\{og:url\}\}/g, localizedUrl);
//   pageContent = pageContent.replace(/\{\{og:url\}\}/g, localizedUrl);

//   const layoutPath = findLayout(filePath);
//   let layout = ["pageContent"];
//   if (layoutPath) {
//     const layoutModule = await import(pathToFileURL(layoutPath).href);
//     layout = layoutModule.default();
//   }

//   const cleanOutputPath = stripGroupsFromPath(filePath).replace(/\/+/g, "/");
//   const outputPath = isPrimaryLang
//     ? path.join(
//         DIST_PATH,
//         cleanOutputPath === "index"
//           ? "index.html"
//           : `${cleanOutputPath}/index.html`
//       )
//     : path
//         .join(
//           DIST_PATH,
//           lang,
//           cleanOutputPath === "index"
//             ? "index.html"
//             : `${cleanOutputPath}/index.html`
//         )
//         .replace(/\/+/g, "/");

//   // Charger les éléments du design system (templates, layouts, composants)
//   const dom = new JSDOM(pageContent);
//   const document = dom.window.document;
//   const elements = document.querySelectorAll("*");
//   elements.forEach((element) => {
//     const newHtml = loadDesignSystemElement(
//       element,
//       lang,
//       outputPath,
//       isPrimaryLang
//     );
//     if (newHtml !== element.outerHTML) {
//       const newDom = new JSDOM(newHtml);
//       element.replaceWith(newDom.window.document.body.firstElementChild);
//     }
//   });

//   // Nouvelle étape : Traiter les icônes autonomes dans la page
//   const iconElements = document.querySelectorAll("img");
//   iconElements.forEach((img) => {
//     const className = img.className;
//     if (iconClassToAttributes.has(className)) {
//       const { src, alt } = iconClassToAttributes.get(className);
//       img.setAttribute("src", src);
//       img.setAttribute("alt", alt);
//       console.log(
//         `Icône autonome traitée : ${className} -> src="${src}", alt="${alt}"`
//       );
//     }
//   });

//   pageContent = dom.serialize();
//   pageContent = adjustLinks(pageContent, outputPath, lang);
//   pageContent = adjustMediaLinks(pageContent, outputPath);
//   pageContent = adjustScriptLinks(pageContent, outputPath);

//   const componentsHTML = layout
//     .map((component) =>
//       component === "pageContent"
//         ? `<div id="pageContent">${pageContent}</div>`
//         : loadComponentWithoutReplace(
//             component,
//             lang,
//             outputPath,
//             isPrimaryLang
//           )
//     )
//     .join("\n");

//   const baseDom = new JSDOM(baseHTML);
//   baseDom.window.document.documentElement.lang = lang;

//   let adjustedHTML = adjustLinks(baseDom.serialize(), outputPath, lang);
//   adjustedHTML = adjustMediaLinks(adjustedHTML, outputPath);

//   const adjustedDOM = new JSDOM(adjustedHTML);

//   const headContentElement = adjustedDOM.window.document.querySelector(
//     ".custom-head-content"
//   );
//   if (headContentElement) {
//     const head = adjustedDOM.window.document.querySelector("head");
//     headContentElement.outerHTML = "";
//     head.insertAdjacentHTML("beforeend", metaContent); // meta non remplacée
//   }

//   const slotElement = adjustedDOM.window.document.querySelector("slot");
//   if (slotElement) {
//     slotElement.outerHTML = componentsHTML.trim();
//   }

//   let finalHtml = adjustedDOM.serialize();

//   // Maintenant, collecter toutes les traductions et remplacer après assemblage
//   let mergedTranslations = localePath ? readJSON(localePath) : {};

//   layout.forEach((component) => {
//     if (component !== "pageContent") {
//       const compLocalePath = path.join(
//         LOCALES_PATH,
//         "frames",
//         component,
//         `${lang}.json`
//       );
//       if (fs.existsSync(compLocalePath)) {
//         const compTranslations = readJSON(compLocalePath);
//         // Fusion : les traductions des composants écrasent si conflit (ou inversez l'ordre si préféré)
//         Object.assign(mergedTranslations, compTranslations);
//         // Option : vérifier conflits
//         // for (const key in compTranslations) {
//         //   if (mergedTranslations.hasOwnProperty(key)) {
//         //     console.warn(`Conflit de clé ${key} entre page/frames et ${component}`);
//         //   }
//         // }
//       }
//     }
//   });

//   finalHtml = replacePlaceholders(finalHtml, mergedTranslations);

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true });
//   fs.writeFileSync(outputPath, finalHtml);

//   console.log(`✅ Génération réussie : ${outputPath}`);
// }

// async function generateLayoutMap() {
//   const pages = glob.sync("**/index.html", { cwd: APP_PATH });
//   const layoutGroups = {};

//   for (const page of pages) {
//     const dirPath = path.dirname(page);
//     const groupMatch = dirPath.match(/\(([^)]+)\)/);
//     const groupLayout = groupMatch ? groupMatch[1] : "default";

//     const cleanPath = `/${stripGroupsFromPath(dirPath)}`;

//     if (!layoutGroups[groupLayout]) {
//       const layoutPath = findLayout(cleanPath);
//       let components = ["pageContent"];

//       if (layoutPath) {
//         const layoutModule = await import(pathToFileURL(layoutPath).href);
//         components = layoutModule.default();
//       }

//       layoutGroups[groupLayout] = {
//         group: groupLayout,
//         components: components,
//         pages: [],
//       };
//     }

//     layoutGroups[groupLayout].pages.push(cleanPath);
//   }

//   const outputData = Object.values(layoutGroups);
//   const outputPath = path.join(DIST_PATH, "layout-map.json");
//   fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

//   console.log(`✅ layout-map.json généré à ${outputPath}`);
// }

// async function buildSite() {
//   await updateRouterLanguages();
//   // Nettoyage
//   cleanDist();

//   // Copier all.scss vers le dossier scss (avant la compilation des styles)
//   copyAllScss();

//   // Compilation styles
//   console.log("Building styles...");
//   try {
//     const { stdout, stderr } = await execAsync("npm run build:styles:min");
//     console.log(stdout);
//     if (stderr) {
//       console.error(stderr);
//     }
//   } catch (error) {
//     console.error(`Error during styles build: ${error.message}`);
//     throw error;
//   }

//   // Copier dossiers publics
//   copyFolder(path.resolve("assets"), path.join(DIST_PATH, "assets"));
//   copyFolder(path.resolve("js"), path.join(DIST_PATH, "js"));
//   copyFolder(path.resolve("lib"), path.join(DIST_PATH, "lib"));
//   copyFolder(path.resolve("modals"), path.join(DIST_PATH, "modals"));
//   copyFolder(path.resolve("config"), path.join(DIST_PATH, "config"));

//   // Collecter les noms de classes du design system
//   collectDesignSystemClassNames();

//   // Récupérer liste de pages
//   const pages = glob
//     .sync("**/index.html", { cwd: APP_PATH })
//     .map((file) => path.dirname(file));

//   // Générer pages / langues
//   for (const page of pages) {
//     for (const lang of availableLanguages) {
//       const isPrimaryLang = isDefaultLanguage(lang);
//       await generatePage(page, lang, isPrimaryLang);
//     }
//   }
//   generateLayoutMap();
// }

// buildSite();

// import fs from "fs";
// import path from "path";
// import { JSDOM } from "jsdom";
// import { glob } from "glob";
// import { pathToFileURL } from "url";
// import { exec } from "child_process";
// import { promisify } from "util";
// import {
//   baseUrl,
//   availableLanguages,
//   isDefaultLanguage,
//   prependLangSlug,
// } from "../config/config-app.js"; // Import des fonctions de gestion des langues

// // Fonction pour mettre à jour router.js avec la liste des langues
// async function updateRouterLanguages() {
//   try {
//     // 1. Lire config/languages.js
//     const languagesPath = path.resolve("config/config-app.js");
//     const languagesContent = fs.readFileSync(languagesPath, "utf8");

//     // Extraire availableLanguages en utilisant une expression régulière
//     const availableLanguagesMatch = languagesContent.match(
//       /availableLanguages\s*=\s*\[(.*?)\]/
//     );
//     if (!availableLanguagesMatch) {
//       throw new Error(
//         "Impossible de trouver availableLanguages dans config/config-app.js"
//       );
//     }

//     // Extraire la liste des langues (en enlevant les guillemets et les espaces)
//     const languagesArray = availableLanguagesMatch[1]
//       .split(",")
//       .map((lang) => lang.trim().replace(/['"]/g, ""));

//     // 2. Lire le contenu actuel de router.js
//     const routerPath = path.resolve("js/router.js");
//     let routerContent = fs.readFileSync(routerPath, "utf8");

//     // 3. Remplacer la ligne de availableLanguages dans router.js
//     const newLanguagesLine = `const availableLanguages = ${JSON.stringify(
//       languagesArray
//     )};`;
//     const languagesRegex = /const availableLanguages = \[.*?\];/;
//     if (!languagesRegex.test(routerContent)) {
//       throw new Error(
//         "Impossible de trouver la ligne de availableLanguages dans router.js"
//       );
//     }

//     routerContent = routerContent.replace(languagesRegex, newLanguagesLine);

//     // 4. Écrire le nouveau contenu dans router.js
//     fs.writeFileSync(routerPath, routerContent, "utf8");
//     console.log(
//       "✅ router.js a été mis à jour avec la liste des langues :",
//       languagesArray
//     );
//   } catch (err) {
//     console.error(
//       "❌ Erreur lors de la mise à jour de router.js :",
//       err.message
//     );
//   }
// }

// const DIST_PATH = path.resolve("dist");
// const APP_PATH = path.resolve("app");
// const LOCALES_PATH = path.resolve("content");
// const COMPONENTS_PATH = path.resolve("frames"); // Préservé, ne pas toucher
// const BASE_HTML = path.resolve("server/base.html");
// const DESIGN_SYSTEM_PATH = path.resolve("design-system");
// const DESIGN_SYSTEM_COMPONENTS_PATH = path.join(
//   DESIGN_SYSTEM_PATH,
//   "components"
// );
// const DESIGN_SYSTEM_LAYOUTS_PATH = path.join(DESIGN_SYSTEM_PATH, "layouts");
// const DESIGN_SYSTEM_TEMPLATES_PATH = path.join(DESIGN_SYSTEM_PATH, "templates");
// const ICONS_PATH = path.join(DESIGN_SYSTEM_PATH, "icons"); // Ajout du chemin pour icons
// const SCSS_PATH = path.resolve("scss");
// const ALL_SCSS_SOURCE = path.join(DESIGN_SYSTEM_PATH, "all.scss");
// const ALL_SCSS_DEST = path.join(SCSS_PATH, "all.scss");
// const execAsync = promisify(exec);

// // Maps pour associer les classes des éléments du design system à leurs répertoires
// const designSystemComponentClassToDir = new Map();
// const designSystemLayoutClassToDir = new Map();
// const designSystemTemplateClassToDir = new Map();
// const iconClassToAttributes = new Map(); // Nouveau mapping pour les icônes

// function stripGroupsFromPath(filePath) {
//   return filePath.replace(/\(.*?\)\//g, ""); // Supprime tous les groupes des chemins
// }

// // Collecter les noms de classes des composants, layouts, templates et icônes du design system
// function collectDesignSystemClassNames() {
//   // Collecter les composants
//   const componentFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_COMPONENTS_PATH,
//   });
//   componentFiles.forEach((file) => {
//     const componentDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_COMPONENTS_PATH,
//       componentDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemComponentClassToDir.set(rootElement.className, componentDir);
//     }
//   });

//   // Collecter les layouts
//   const layoutFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_LAYOUTS_PATH,
//   });
//   layoutFiles.forEach((file) => {
//     const layoutDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_LAYOUTS_PATH,
//       layoutDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemLayoutClassToDir.set(rootElement.className, layoutDir);
//     }
//   });

//   // Collecter les templates
//   const templateFiles = glob.sync("**/index.html", {
//     cwd: DESIGN_SYSTEM_TEMPLATES_PATH,
//   });
//   templateFiles.forEach((file) => {
//     const templateDir = path.dirname(file);
//     const indexPath = path.join(
//       DESIGN_SYSTEM_TEMPLATES_PATH,
//       templateDir,
//       "index.html"
//     );
//     const html = fs.readFileSync(indexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const rootElement = document.body.firstElementChild;
//     if (rootElement && rootElement.className) {
//       designSystemTemplateClassToDir.set(rootElement.className, templateDir);
//     }
//   });

//   // Collecter les icônes
//   const iconsIndexPath = path.join(ICONS_PATH, "index.html");
//   if (fs.existsSync(iconsIndexPath)) {
//     const html = fs.readFileSync(iconsIndexPath, "utf8");
//     const dom = new JSDOM(html);
//     const document = dom.window.document;
//     const iconElements = document.querySelectorAll(".icon-library img");
//     iconElements.forEach((img) => {
//       const className = img.className;
//       const src = img.getAttribute("src");
//       const alt = img.getAttribute("alt");
//       if (className && src && alt) {
//         iconClassToAttributes.set(className, { src, alt });
//       }
//     });
//   }

//   console.log(
//     "Design System Component class-to-directory mapping:",
//     Object.fromEntries(designSystemComponentClassToDir)
//   );
//   console.log(
//     "Design System Layout class-to-directory mapping:",
//     Object.fromEntries(designSystemLayoutClassToDir)
//   );
//   console.log(
//     "Design System Template class-to-directory mapping:",
//     Object.fromEntries(designSystemTemplateClassToDir)
//   );
//   console.log(
//     "Icon class-to-attributes mapping:",
//     Object.fromEntries(iconClassToAttributes)
//   );
// }

// // Nettoie dist avant chaque build
// function cleanDist() {
//   if (fs.existsSync(DIST_PATH)) {
//     fs.rmSync(DIST_PATH, { recursive: true, force: true });
//     console.log("✅ Cleaned up previous dist folder.");
//   }
//   // 🔥 Supprime les dossiers de groupes (juste au cas où)
//   const groupFolders = glob.sync(`${DIST_PATH}/(*/`);
//   groupFolders.forEach((folder) =>
//     fs.rmSync(folder, { recursive: true, force: true })
//   );
// }

// function resolveFilePath(filePath) {
//   // Vérifie si le fichier existe directement
//   if (fs.existsSync(path.join(APP_PATH, filePath, "index.html"))) {
//     return path.join(APP_PATH, filePath);
//   }

//   // Recherche dans les dossiers de groupes (dossiers entre parenthèses)
//   const parentFolders = glob.sync(`*/${filePath}`, { cwd: APP_PATH });

//   for (const folder of parentFolders) {
//     if (fs.existsSync(path.join(APP_PATH, folder, "index.html"))) {
//       return path.join(APP_PATH, folder);
//     }
//   }

//   return null;
// }

// // Copie un dossier source → destination
// function copyFolder(source, destination) {
//   if (fs.existsSync(source)) {
//     fs.mkdirSync(destination, { recursive: true });
//     fs.cpSync(source, destination, { recursive: true });
//     console.log(`Copied ${source} to ${destination}.`);
//   } else {
//     console.log(`Folder ${source} does not exist, skipping.`);
//   }
// }

// // Fonction pour générer all.scss en concaténant le contenu de tous les fichiers *.scss du dossier design-system
// function copyAllScss() {
//   console.log(
//     "Génération de all.scss en concaténant le contenu des fichiers *.scss du dossier design-system..."
//   );

//   // Trouver tous les fichiers *.scss dans le dossier design-system (y compris sous-dossiers)
//   const scssFiles = glob.sync("**/*.scss", { cwd: DESIGN_SYSTEM_PATH });

//   if (scssFiles.length === 0) {
//     console.error(
//       `Erreur : Aucun fichier *.scss trouvé dans ${DESIGN_SYSTEM_PATH}.`
//     );
//     throw new Error("Aucun fichier SCSS trouvé dans design-system");
//   }

//   // Prioriser les fichiers susceptibles de contenir des définitions de variables
//   const priorityFiles = [
//     "variables.scss",
//     "colors.scss",
//     "typography.scss",
//     "base.scss",
//   ];
//   const prioritizedFiles = [];
//   const remainingFiles = [];

//   // Séparer les fichiers prioritaires des autres
//   scssFiles.forEach((file) => {
//     const fileName = path.basename(file);
//     if (priorityFiles.includes(fileName)) {
//       prioritizedFiles.push(file);
//     } else {
//       remainingFiles.push(file);
//     }
//   });

//   // Trier les fichiers prioritaires pour respecter l'ordre : variables.scss, colors.scss, typography.scss, base.scss
//   prioritizedFiles.sort((a, b) => {
//     const aIndex = priorityFiles.indexOf(path.basename(a));
//     const bIndex = priorityFiles.indexOf(path.basename(b));
//     return aIndex - bIndex;
//   });

//   // Combiner les fichiers : d'abord les prioritaires, puis les autres
//   const orderedFiles = [...prioritizedFiles, ...remainingFiles];

//   // Créer le dossier scss s'il n'existe pas
//   if (!fs.existsSync(SCSS_PATH)) {
//     fs.mkdirSync(SCSS_PATH, { recursive: true });
//     console.log(`Dossier créé : ${SCSS_PATH}`);
//   }

//   // Générer le contenu de all.scss en concaténant le contenu de chaque fichier SCSS
//   const allScssContent = orderedFiles
//     .map((file) => {
//       const filePath = path.join(DESIGN_SYSTEM_PATH, file);
//       const scssContent = fs.readFileSync(filePath, "utf8").trim();
//       console.log(`Ajouté contenu SCSS de : ${filePath}`);
//       return scssContent;
//     })
//     .filter((content) => content) // Ignorer les fichiers vides
//     .join("\n\n");

//   // Écrire le fichier all.scss dans le dossier scss
//   fs.writeFileSync(ALL_SCSS_DEST, allScssContent, "utf8");
//   console.log(
//     `Généré : ${ALL_SCSS_DEST} avec ${orderedFiles.length} fichiers SCSS concaténés`
//   );
// }

// function readJSON(filePath) {
//   return JSON.parse(fs.readFileSync(filePath, "utf8"));
// }

// // Remplace les {{clé}} par leur traduction… si elle existe.
// function replacePlaceholders(template, translations) {
//   return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
//     if (translations[key] !== undefined) {
//       return translations[key];
//     }
//     return `{{${key}}}`;
//   });
// }

// function calculateDirectoryBasePath(outputPath) {
//   const depth =
//     path.dirname(outputPath).split(path.sep).length -
//     DIST_PATH.split(path.sep).length;
//   return "../".repeat(Math.max(0, depth));
// }

// function adjustLinks(html, outputPath, lang) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);

//   // Remplacer [ROOT] dans tous les cas
//   let adjustedHtml = html.replace(/\[ROOT\]/g, directoryBasePath);

//   // Modifier les href uniquement s'ils contiennent [ROOT] ou ont été modifiés pour contenir directoryBasePath
//   adjustedHtml = adjustedHtml.replace(/href="(.*?)"/g, (match, href) => {
//     // Ne pas modifier les URLs absolues (http:// ou https://) sauf si elles contiennent [ROOT]
//     if (
//       /^https?:\/\//i.test(href) &&
//       !href.includes("[ROOT]") &&
//       !href.includes(directoryBasePath)
//     ) {
//       return match;
//     }

//     // Ne modifier que si l'URL contient directoryBasePath (après remplacement de [ROOT])
//     if (href.includes(directoryBasePath)) {
//       if (href.startsWith("/")) {
//         const adjustedHref = prependLangSlug(href, lang); // Appel avec seulement href et lang
//         return `href="${adjustedHref}"`;
//       }
//       if (!isDefaultLanguage(lang)) {
//         return `href="${directoryBasePath}${lang}/${href.replace(
//           directoryBasePath,
//           ""
//         )}"`;
//       }
//     }

//     return match;
//   });

//   // Nettoyer les doubles slashes
//   adjustedHtml = adjustedHtml.replace(/([^:])\/\//g, "$1/");

//   return adjustedHtml;
// }

// function adjustMediaLinks(html, outputPath) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);
//   const dom = new JSDOM(html);
//   const document = dom.window.document;

//   document.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
//     let href = link.getAttribute("href");
//     if (href && (href.includes("[ROOT]") || href.includes(directoryBasePath))) {
//       href = href.replace(/\/[a-z]{2}\//, "/");
//       href = href.replace("[ROOT]", directoryBasePath);
//       href = href.replace(/([^:]\/)\/+/g, "$1");
//       link.setAttribute("href", href);
//     }
//   });

//   document.querySelectorAll("img[src]").forEach((img) => {
//     let src = img.getAttribute("src");
//     if (src && (src.includes("[ROOT]") || src.includes(directoryBasePath))) {
//       src = src.replace(/\/[a-z]{2}\//, "/");
//       src = src.replace("[ROOT]", directoryBasePath);
//       src = src.replace(/([^:]\/)\/+/g, "$1");
//       img.setAttribute("src", src);
//     }
//   });

//   return dom.serialize();
// }

// function adjustScriptLinks(html, outputPath) {
//   const directoryBasePath = calculateDirectoryBasePath(outputPath);
//   const dom = new JSDOM(html);
//   const document = dom.window.document;

//   document.querySelectorAll("script[src]").forEach((script) => {
//     let src = script.getAttribute("src");
//     if (src && src.includes("[ROOT]")) {
//       src = src.replace("[ROOT]", directoryBasePath);
//       src = src.replace(/([^:]\/)\/+/g, "$1");
//       script.setAttribute("src", src);
//     }
//   });

//   return dom.serialize();
// }

// // Fonction modifiée pour charger les composants sans remplacement des placeholders
// function loadComponentWithoutReplace(
//   componentName,
//   lang,
//   outputPath,
//   isPrimaryLang
// ) {
//   const componentPath = path.join(COMPONENTS_PATH, componentName, "index.html");

//   if (!fs.existsSync(componentPath)) {
//     console.error(`Missing component: ${componentName}`);
//     return "";
//   }

//   const componentTemplate = fs.readFileSync(componentPath, "utf8");

//   let html = componentTemplate; // Pas de remplacement ici

//   // Traiter les éléments du design-system dans le composant
//   const dom = new JSDOM(`<div>${html}</div>`);
//   const document = dom.window.document;
//   const elements = document.querySelectorAll("*");
//   elements.forEach((element) => {
//     const newHtml = loadDesignSystemElement(
//       element,
//       lang,
//       outputPath,
//       isPrimaryLang
//     );
//     if (newHtml !== element.outerHTML) {
//       const newDom = new JSDOM(newHtml);
//       element.replaceWith(newDom.window.document.body.firstElementChild);
//     }
//   });

//   html = dom.window.document.body.firstElementChild.innerHTML;
//   html = adjustLinks(html, outputPath, lang);
//   html = adjustMediaLinks(html, outputPath);

//   return html.trim();
// }

// function loadDesignSystemElement(
//   element,
//   lang,
//   outputPath,
//   isPrimaryLang,
//   inheritedValues = {},
//   parentElement = null
// ) {
//   const classList = element.className ? element.className.split(/\s+/) : [];
//   let elementPath;
//   let matchedClass;

//   // Étape a) : Vérifier si une des classes correspond à un layout, un composant ou un template
//   for (const className of classList) {
//     if (
//       className.endsWith("-layout") &&
//       designSystemLayoutClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_LAYOUTS_PATH,
//         designSystemLayoutClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     } else if (
//       className.endsWith("-component") &&
//       designSystemComponentClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_COMPONENTS_PATH,
//         designSystemComponentClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     } else if (
//       className.endsWith("-template") &&
//       designSystemTemplateClassToDir.has(className)
//     ) {
//       elementPath = path.join(
//         DESIGN_SYSTEM_TEMPLATES_PATH,
//         designSystemTemplateClassToDir.get(className),
//         "index.html"
//       );
//       matchedClass = className;
//       break;
//     }
//   }

//   if (elementPath && fs.existsSync(elementPath)) {
//     let elementHtml = fs.readFileSync(elementPath, "utf8");
//     const elementDom = new JSDOM(elementHtml);
//     const elementRoot = elementDom.window.document.body.firstElementChild;

//     // Étape b) : Extraire les valeurs des placeholders de l'élément de la page
//     // Utiliser une regex plus permissive pour gérer les guillemets dans les valeurs
//     const pagePlaceholders =
//       element.innerHTML.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/gs) || [];
//     const pageValues = { ...inheritedValues };

//     // console.log(
//     //   `Extracted placeholders for element ${matchedClass}:`,
//     //   pagePlaceholders
//     // );

//     pagePlaceholders.forEach((placeholder) => {
//       const match = placeholder.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/s);
//       if (match) {
//         const [, name, value] = match;
//         pageValues[name] = value;
//         console.log(`Placeholder [${name}] assigned value: ${value}`);
//       } else {
//         console.warn(`Invalid placeholder format: ${placeholder}`);
//       }
//     });

//     // Étape c) : Remplacer les placeholders dans le contenu HTML (innerHTML) de l'élément courant
//     let elementContent = elementRoot.innerHTML;
//     Object.keys(pageValues).forEach((key) => {
//       const value = pageValues[key];
//       console.log(`Replacing placeholder [${key}] with value: ${value}`);

//       // Supprimer le placeholder de définition (ex: [key]: "value";)
//       elementContent = elementContent.replace(
//         new RegExp(`\\[${key}\\]:\s*".*?"\\s*;`, "gs"),
//         ""
//       );

//       // Vérifier si la valeur contient du HTML (balises comme <br>, <span>, etc.)
//       const containsHtml = /<[a-z][\s\S]*>/i.test(value);
//       if (containsHtml) {
//         console.log(`Value for [${key}] contains HTML, inserting as raw HTML`);
//         // Si la valeur contient du HTML, l'insérer comme HTML brut
//         const tempDom = new JSDOM(`<div>${elementContent}</div>`);
//         const tempDoc = tempDom.window.document;
//         const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
//         const matches = elementContent.match(placeholderRegex);
//         if (matches) {
//           elementContent = elementContent.replace(placeholderRegex, value);
//         } else {
//           console.warn(
//             `Placeholder [${key}] not found in element content: ${elementContent}`
//           );
//         }
//       } else {
//         // Si la valeur est du texte brut, la remplacer comme avant
//         const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
//         const matches = elementContent.match(placeholderRegex);
//         if (matches) {
//           elementContent = elementContent.replace(placeholderRegex, value);
//         } else {
//           console.warn(
//             `Placeholder [${key}] not found in element content: ${elementContent}`
//           );
//         }
//       }
//     });

//     // Étape d) : Traiter récursivement les éléments enfants (layouts, composants, templates)
//     const childDom = new JSDOM(`<div>${elementContent}</div>`);
//     const childElements = childDom.window.document.querySelectorAll("*");
//     childElements.forEach((childElement) => {
//       const childClassName = childElement.className;
//       if (
//         (childClassName && childClassName.endsWith("-layout")) ||
//         (childClassName && childClassName.endsWith("-component")) ||
//         (childClassName && childClassName.endsWith("-template"))
//       ) {
//         const newChildHtml = loadDesignSystemElement(
//           childElement,
//           lang,
//           outputPath,
//           isPrimaryLang,
//           pageValues,
//           elementRoot
//         );
//         const newChildDom = new JSDOM(newChildHtml);
//         childElement.replaceWith(
//           newChildDom.window.document.body.firstElementChild
//         );
//       }
//     });

//     // Mettre à jour le contenu de l'élément avec les enfants traités
//     elementContent = childDom.window.document.body.firstElementChild.innerHTML;

//     // Étape e) : Remplacer les icônes par leurs balises complètes
//     const iconDom = new JSDOM(`<div>${elementContent}</div>`);
//     const iconElements = iconDom.window.document.querySelectorAll("img");
//     iconElements.forEach((img) => {
//       const className = img.className;
//       if (iconClassToAttributes.has(className)) {
//         const { src, alt } = iconClassToAttributes.get(className);
//         img.setAttribute("src", src);
//         img.setAttribute("alt", alt);
//       }
//     });

//     // Mettre à jour le contenu avec les icônes remplacées
//     elementContent = iconDom.window.document.body.firstElementChild.innerHTML;

//     // Étape f) : Remplacer les placeholders dans les attributs des éléments enfants
//     const finalDom = new JSDOM(`<div>${elementContent}</div>`);
//     const allElements = finalDom.window.document.querySelectorAll("*");
//     allElements.forEach((el) => {
//       Array.from(el.attributes).forEach((attr) => {
//         const attrValue = attr.value;
//         Object.keys(pageValues).forEach((key) => {
//           const value = pageValues[key];
//           if (attrValue.includes(`[${key}]`)) {
//             attr.value = attrValue.replace(
//               new RegExp(`\\[${key}\\]`, "g"),
//               value
//             );
//           }
//         });
//       });
//     });

//     // Mettre à jour le contenu avec les attributs modifiés
//     elementContent = finalDom.window.document.body.firstElementChild.innerHTML;

//     // Reconstruire l'élément avec le contenu mis à jour
//     elementRoot.innerHTML = elementContent;

//     // Étape g) : Préservez toutes les classes de l'élément original
//     elementRoot.className = element.className;

//     // Étape h) : Copier tous les autres attributs de l'élément original vers elementRoot
//     Array.from(element.attributes).forEach((attr) => {
//       if (attr.name !== "class") {
//         elementRoot.setAttribute(attr.name, attr.value);
//       }
//     });

//     // Étape i) : Remplacer les placeholders dans les attributs de elementRoot lui-même
//     Array.from(elementRoot.attributes).forEach((attr) => {
//       const attrValue = attr.value;
//       Object.keys(pageValues).forEach((key) => {
//         const value = pageValues[key];
//         if (attrValue.includes(`[${key}]`)) {
//           attr.value = attrValue.replace(
//             new RegExp(`\\[${key}\\]`, "g"),
//             value
//           );
//         }
//       });
//     });

//     // Étape j) : Si l'élément chargé est une balise différente (par exemple, <button> remplacé par <a>),
//     // copier les attributs de la balise parent (si fournie)
//     if (
//       parentElement &&
//       elementRoot.tagName.toLowerCase() !== element.tagName.toLowerCase()
//     ) {
//       Array.from(parentElement.attributes).forEach((attr) => {
//         if (attr.name !== "class") {
//           elementRoot.setAttribute(attr.name, attr.value);
//         }
//       });
//     }

//     // Ajuster les liens et médias dans l'élément chargé
//     let adjustedHtml = adjustLinks(elementRoot.outerHTML, outputPath, lang);
//     adjustedHtml = adjustMediaLinks(adjustedHtml, outputPath);

//     return adjustedHtml;
//   }

//   return element.outerHTML;
// }

// function findLayout(filePath) {
//   const localLayoutPath = path.join(APP_PATH, filePath, "layout.js");
//   if (fs.existsSync(localLayoutPath)) {
//     return localLayoutPath;
//   }
//   let currentPath = path.dirname(path.join(APP_PATH, filePath));

//   while (currentPath !== APP_PATH) {
//     const layoutPath = path.join(currentPath, "layout.js");
//     if (fs.existsSync(layoutPath)) {
//       return layoutPath;
//     }
//     currentPath = path.dirname(currentPath);
//   }
//   const rootLayoutPath = path.join(APP_PATH, "layout.js");
//   return fs.existsSync(rootLayoutPath) ? rootLayoutPath : null;
// }

// async function generatePage(filePath, lang, isPrimaryLang = false) {
//   const baseHTML = fs.readFileSync(BASE_HTML, "utf8");

//   const normalizedPath = stripGroupsFromPath(filePath);
//   const resolvedPath = resolveFilePath(normalizedPath);
//   if (!resolvedPath) {
//     console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
//     return;
//   }

//   const metaPath = path.join(resolvedPath, "meta.html");
//   const contentPath = path.join(resolvedPath, "index.html");

//   if (!fs.existsSync(contentPath)) {
//     console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
//     return;
//   }

//   let localePath = path.join(
//     LOCALES_PATH,
//     "pages",
//     normalizedPath,
//     `${lang}.json`
//   );
//   if (!fs.existsSync(localePath)) {
//     console.warn(
//       `⚠️ Avertissement : Pas de traduction trouvée pour ${filePath} en ${lang}`
//     );
//     localePath = null;
//   }

//   let metaContent = fs.existsSync(metaPath)
//     ? fs.readFileSync(metaPath, "utf8").trim()
//     : "";
//   let pageContent = fs.readFileSync(contentPath, "utf8").trim();

//   // Pas de remplacement des placeholders ici, on le fera après l'assemblage

//   const cleanFilePath = stripGroupsFromPath(filePath);
//   const localizedUrl = isPrimaryLang
//     ? `${baseUrl}/${cleanFilePath === "index" ? "" : cleanFilePath}`
//     : `${baseUrl}/${lang}/${cleanFilePath === "index" ? "" : cleanFilePath}`;

//   // Remplacements manuels pour {{og:url}} (pas des placeholders i18n standards)
//   metaContent = metaContent.replace(/\{\{og:url\}\}/g, localizedUrl);
//   pageContent = pageContent.replace(/\{\{og:url\}\}/g, localizedUrl);

//   const layoutPath = findLayout(filePath);
//   let layout = ["pageContent"];
//   if (layoutPath) {
//     const layoutModule = await import(pathToFileURL(layoutPath).href);
//     layout = layoutModule.default();
//   }

//   const cleanOutputPath = stripGroupsFromPath(filePath).replace(/\/+/g, "/");
//   const outputPath = isPrimaryLang
//     ? path.join(
//         DIST_PATH,
//         cleanOutputPath === "index"
//           ? "index.html"
//           : `${cleanOutputPath}/index.html`
//       )
//     : path
//         .join(
//           DIST_PATH,
//           lang,
//           cleanOutputPath === "index"
//             ? "index.html"
//             : `${cleanOutputPath}/index.html`
//         )
//         .replace(/\/+/g, "/");

//   // Charger les éléments du design system (templates, layouts, composants)
//   const dom = new JSDOM(pageContent);
//   const document = dom.window.document;
//   const elements = document.querySelectorAll("*");
//   elements.forEach((element) => {
//     const newHtml = loadDesignSystemElement(
//       element,
//       lang,
//       outputPath,
//       isPrimaryLang
//     );
//     if (newHtml !== element.outerHTML) {
//       const newDom = new JSDOM(newHtml);
//       element.replaceWith(newDom.window.document.body.firstElementChild);
//     }
//   });

//   // Nouvelle étape : Traiter les icônes autonomes dans la page
//   const iconElements = document.querySelectorAll("img");
//   iconElements.forEach((img) => {
//     const className = img.className;
//     if (iconClassToAttributes.has(className)) {
//       const { src, alt } = iconClassToAttributes.get(className);
//       img.setAttribute("src", src);
//       img.setAttribute("alt", alt);
//       console.log(
//         `Icône autonome traitée : ${className} -> src="${src}", alt="${alt}"`
//       );
//     }
//   });

//   pageContent = dom.serialize();
//   pageContent = adjustLinks(pageContent, outputPath, lang);
//   pageContent = adjustMediaLinks(pageContent, outputPath);
//   pageContent = adjustScriptLinks(pageContent, outputPath);

//   const componentsHTML = layout
//     .map((component) =>
//       component === "pageContent"
//         ? `<div id="pageContent">${pageContent}</div>`
//         : loadComponentWithoutReplace(
//             component,
//             lang,
//             outputPath,
//             isPrimaryLang
//           )
//     )
//     .join("\n");

//   const baseDom = new JSDOM(baseHTML);
//   baseDom.window.document.documentElement.lang = lang;

//   let adjustedHTML = adjustLinks(baseDom.serialize(), outputPath, lang);
//   adjustedHTML = adjustMediaLinks(adjustedHTML, outputPath);

//   const adjustedDOM = new JSDOM(adjustedHTML);

//   const headContentElement = adjustedDOM.window.document.querySelector(
//     ".custom-head-content"
//   );
//   if (headContentElement) {
//     const head = adjustedDOM.window.document.querySelector("head");
//     headContentElement.outerHTML = "";
//     head.insertAdjacentHTML("beforeend", metaContent); // meta non remplacée
//   }

//   const slotElement = adjustedDOM.window.document.querySelector("slot");
//   if (slotElement) {
//     slotElement.outerHTML = componentsHTML.trim();
//   }

//   let finalHtml = adjustedDOM.serialize();

//   // Maintenant, collecter toutes les traductions et remplacer après assemblage
//   let mergedTranslations = {};

//   layout.forEach((component) => {
//     if (component !== "pageContent") {
//       const compLocalePath = path.join(
//         LOCALES_PATH,
//         "frames",
//         component,
//         `${lang}.json`
//       );
//       if (fs.existsSync(compLocalePath)) {
//         const compTranslations = readJSON(compLocalePath);
//         Object.assign(mergedTranslations, compTranslations);
//       }
//     }
//   });

//   if (localePath) {
//     const pageTranslations = readJSON(localePath);
//     Object.assign(mergedTranslations, pageTranslations);
//   }

//   finalHtml = replacePlaceholders(finalHtml, mergedTranslations);

//   fs.mkdirSync(path.dirname(outputPath), { recursive: true });
//   fs.writeFileSync(outputPath, finalHtml);

//   console.log(`✅ Génération réussie : ${outputPath}`);
// }

// async function generateLayoutMap() {
//   const pages = glob.sync("**/index.html", { cwd: APP_PATH });
//   const layoutGroups = {};

//   for (const page of pages) {
//     const dirPath = path.dirname(page);
//     const groupMatch = dirPath.match(/\(([^)]+)\)/);
//     const groupLayout = groupMatch ? groupMatch[1] : "default";

//     const cleanPath = `/${stripGroupsFromPath(dirPath)}`;

//     if (!layoutGroups[groupLayout]) {
//       const layoutPath = findLayout(cleanPath);
//       let components = ["pageContent"];

//       if (layoutPath) {
//         const layoutModule = await import(pathToFileURL(layoutPath).href);
//         components = layoutModule.default();
//       }

//       layoutGroups[groupLayout] = {
//         group: groupLayout,
//         components: components,
//         pages: [],
//       };
//     }

//     layoutGroups[groupLayout].pages.push(cleanPath);
//   }

//   const outputData = Object.values(layoutGroups);
//   const outputPath = path.join(DIST_PATH, "layout-map.json");
//   fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

//   console.log(`✅ layout-map.json généré à ${outputPath}`);
// }

// async function buildSite() {
//   await updateRouterLanguages();
//   // Nettoyage
//   cleanDist();

//   // Copier all.scss vers le dossier scss (avant la compilation des styles)
//   copyAllScss();

//   // Compilation styles
//   console.log("Building styles...");
//   try {
//     const { stdout, stderr } = await execAsync("npm run build:styles:min");
//     console.log(stdout);
//     if (stderr) {
//       console.error(stderr);
//     }
//   } catch (error) {
//     console.error(`Error during styles build: ${error.message}`);
//     throw error;
//   }

//   // Copier dossiers publics
//   copyFolder(path.resolve("assets"), path.join(DIST_PATH, "assets"));
//   copyFolder(path.resolve("js"), path.join(DIST_PATH, "js"));
//   copyFolder(path.resolve("lib"), path.join(DIST_PATH, "lib"));
//   copyFolder(path.resolve("modals"), path.join(DIST_PATH, "modals"));
//   copyFolder(path.resolve("config"), path.join(DIST_PATH, "config"));

//   // Collecter les noms de classes du design system
//   collectDesignSystemClassNames();

//   // Récupérer liste de pages
//   const pages = glob
//     .sync("**/index.html", { cwd: APP_PATH })
//     .map((file) => path.dirname(file));

//   // Générer pages / langues
//   for (const page of pages) {
//     for (const lang of availableLanguages) {
//       const isPrimaryLang = isDefaultLanguage(lang);
//       await generatePage(page, lang, isPrimaryLang);
//     }
//   }
//   generateLayoutMap();
// }

// buildSite();

import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import { glob } from "glob";
import { pathToFileURL } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import {
  baseUrl,
  availableLanguages,
  isDefaultLanguage,
  prependLangSlug,
} from "../config/config-app.js";

// Fonction pour mettre à jour router.js avec la liste des langues
async function updateRouterLanguages() {
  try {
    const languagesPath = path.resolve("config/config-app.js");
    const languagesContent = fs.readFileSync(languagesPath, "utf8");
    const availableLanguagesMatch = languagesContent.match(
      /availableLanguages\s*=\s*\[(.*?)\]/
    );
    if (!availableLanguagesMatch) {
      throw new Error(
        "Impossible de trouver availableLanguages dans config/config-app.js"
      );
    }
    const languagesArray = availableLanguagesMatch[1]
      .split(",")
      .map((lang) => lang.trim().replace(/['"]/g, ""));
    const routerPath = path.resolve("js/router.js");
    let routerContent = fs.readFileSync(routerPath, "utf8");
    const newLanguagesLine = `const availableLanguages = ${JSON.stringify(
      languagesArray
    )};`;
    const languagesRegex = /const availableLanguages = \[.*?\];/;
    if (!languagesRegex.test(routerContent)) {
      throw new Error(
        "Impossible de trouver la ligne de availableLanguages dans router.js"
      );
    }
    routerContent = routerContent.replace(languagesRegex, newLanguagesLine);
    fs.writeFileSync(routerPath, routerContent, "utf8");
    console.log(
      "✅ router.js a été mis à jour avec la liste des langues :",
      languagesArray
    );
  } catch (err) {
    console.error(
      "❌ Erreur lors de la mise à jour de router.js :",
      err.message
    );
  }
}

const DIST_PATH = path.resolve("dist");
const APP_PATH = path.resolve("app");
const LOCALES_PATH = path.resolve("content");
const COMPONENTS_PATH = path.resolve("frames");
const BASE_HTML = path.resolve("server/base.html");
const DESIGN_SYSTEM_PATH = path.resolve("design-system");
const DESIGN_SYSTEM_COMPONENTS_PATH = path.join(
  DESIGN_SYSTEM_PATH,
  "components"
);
const DESIGN_SYSTEM_LAYOUTS_PATH = path.join(DESIGN_SYSTEM_PATH, "layouts");
const DESIGN_SYSTEM_TEMPLATES_PATH = path.join(DESIGN_SYSTEM_PATH, "templates");
const ICONS_PATH = path.join(DESIGN_SYSTEM_PATH, "icons");
const SCSS_PATH = path.resolve("scss");
const ALL_SCSS_SOURCE = path.join(DESIGN_SYSTEM_PATH, "all.scss");
const ALL_SCSS_DEST = path.join(SCSS_PATH, "all.scss");
const execAsync = promisify(exec);

const designSystemComponentClassToDir = new Map();
const designSystemLayoutClassToDir = new Map();
const designSystemTemplateClassToDir = new Map();
const iconClassToAttributes = new Map();

function stripGroupsFromPath(filePath) {
  return filePath.replace(/\(.*?\)\//g, "");
}

function collectDesignSystemClassNames() {
  const componentFiles = glob.sync("**/index.html", {
    cwd: DESIGN_SYSTEM_COMPONENTS_PATH,
  });
  componentFiles.forEach((file) => {
    const componentDir = path.dirname(file);
    const indexPath = path.join(
      DESIGN_SYSTEM_COMPONENTS_PATH,
      componentDir,
      "index.html"
    );
    const html = fs.readFileSync(indexPath, "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const rootElement = document.body.firstElementChild;
    if (rootElement && rootElement.className) {
      designSystemComponentClassToDir.set(rootElement.className, componentDir);
    }
  });

  const layoutFiles = glob.sync("**/index.html", {
    cwd: DESIGN_SYSTEM_LAYOUTS_PATH,
  });
  layoutFiles.forEach((file) => {
    const layoutDir = path.dirname(file);
    const indexPath = path.join(
      DESIGN_SYSTEM_LAYOUTS_PATH,
      layoutDir,
      "index.html"
    );
    const html = fs.readFileSync(indexPath, "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const rootElement = document.body.firstElementChild;
    if (rootElement && rootElement.className) {
      designSystemLayoutClassToDir.set(rootElement.className, layoutDir);
    }
  });

  const templateFiles = glob.sync("**/index.html", {
    cwd: DESIGN_SYSTEM_TEMPLATES_PATH,
  });
  templateFiles.forEach((file) => {
    const templateDir = path.dirname(file);
    const indexPath = path.join(
      DESIGN_SYSTEM_TEMPLATES_PATH,
      templateDir,
      "index.html"
    );
    const html = fs.readFileSync(indexPath, "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const rootElement = document.body.firstElementChild;
    if (rootElement && rootElement.className) {
      designSystemTemplateClassToDir.set(rootElement.className, templateDir);
    }
  });

  const iconsIndexPath = path.join(ICONS_PATH, "index.html");
  if (fs.existsSync(iconsIndexPath)) {
    const html = fs.readFileSync(iconsIndexPath, "utf8");
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const iconElements = document.querySelectorAll(".icon-library img");
    iconElements.forEach((img) => {
      const className = img.className;
      const src = img.getAttribute("src");
      const alt = img.getAttribute("alt");
      if (className && src && alt) {
        iconClassToAttributes.set(className, { src, alt });
      }
    });
  }

  console.log(
    "Design System Component class-to-directory mapping:",
    Object.fromEntries(designSystemComponentClassToDir)
  );
  console.log(
    "Design System Layout class-to-directory mapping:",
    Object.fromEntries(designSystemLayoutClassToDir)
  );
  console.log(
    "Design System Template class-to-directory mapping:",
    Object.fromEntries(designSystemTemplateClassToDir)
  );
  console.log(
    "Icon class-to-attributes mapping:",
    Object.fromEntries(iconClassToAttributes)
  );
}

function cleanDist() {
  if (fs.existsSync(DIST_PATH)) {
    fs.rmSync(DIST_PATH, { recursive: true, force: true });
    console.log("✅ Cleaned up previous dist folder.");
  }
  const groupFolders = glob.sync(`${DIST_PATH}/(*/`);
  groupFolders.forEach((folder) =>
    fs.rmSync(folder, { recursive: true, force: true })
  );
}

function resolveFilePath(filePath) {
  if (fs.existsSync(path.join(APP_PATH, filePath, "index.html"))) {
    return path.join(APP_PATH, filePath);
  }
  const parentFolders = glob.sync(`*/${filePath}`, { cwd: APP_PATH });
  for (const folder of parentFolders) {
    if (fs.existsSync(path.join(APP_PATH, folder, "index.html"))) {
      return path.join(APP_PATH, folder);
    }
  }
  return null;
}

function copyFolder(source, destination) {
  if (fs.existsSync(source)) {
    fs.mkdirSync(destination, { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
    console.log(`Copied ${source} to ${destination}.`);
  } else {
    console.log(`Folder ${source} does not exist, skipping.`);
  }
}

function copyAllScss() {
  console.log(
    "Génération de all.scss en concaténant le contenu des fichiers *.scss du dossier design-system..."
  );
  const scssFiles = glob.sync("**/*.scss", { cwd: DESIGN_SYSTEM_PATH });
  if (scssFiles.length === 0) {
    console.error(
      `Erreur : Aucun fichier *.scss trouvé dans ${DESIGN_SYSTEM_PATH}.`
    );
    throw new Error("Aucun fichier SCSS trouvé dans design-system");
  }
  const priorityFiles = [
    "variables.scss",
    "colors.scss",
    "typography.scss",
    "base.scss",
  ];
  const prioritizedFiles = [];
  const remainingFiles = [];
  scssFiles.forEach((file) => {
    const fileName = path.basename(file);
    if (priorityFiles.includes(fileName)) {
      prioritizedFiles.push(file);
    } else {
      remainingFiles.push(file);
    }
  });
  prioritizedFiles.sort((a, b) => {
    const aIndex = priorityFiles.indexOf(path.basename(a));
    const bIndex = priorityFiles.indexOf(path.basename(b));
    return aIndex - bIndex;
  });
  const orderedFiles = [...prioritizedFiles, ...remainingFiles];
  if (!fs.existsSync(SCSS_PATH)) {
    fs.mkdirSync(SCSS_PATH, { recursive: true });
    console.log(`Dossier créé : ${SCSS_PATH}`);
  }
  const allScssContent = orderedFiles
    .map((file) => {
      const filePath = path.join(DESIGN_SYSTEM_PATH, file);
      const scssContent = fs.readFileSync(filePath, "utf8").trim();
      console.log(`Ajouté contenu SCSS de : ${filePath}`);
      return scssContent;
    })
    .filter((content) => content)
    .join("\n\n");
  fs.writeFileSync(ALL_SCSS_DEST, allScssContent, "utf8");
  console.log(
    `Généré : ${ALL_SCSS_DEST} avec ${orderedFiles.length} fichiers SCSS concaténés`
  );
}

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function replacePlaceholders(template, translations) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    if (translations[key] !== undefined) {
      return translations[key];
    }
    return `{{${key}}}`;
  });
}

function calculateDirectoryBasePath(outputPath) {
  const depth =
    path.dirname(outputPath).split(path.sep).length -
    DIST_PATH.split(path.sep).length;
  return "../".repeat(Math.max(0, depth));
}

function adjustLinks(html, outputPath, lang) {
  const directoryBasePath = calculateDirectoryBasePath(outputPath);
  let adjustedHtml = html.replace(/\[ROOT\]/g, directoryBasePath);
  adjustedHtml = adjustedHtml.replace(/href="(.*?)"/g, (match, href) => {
    if (
      /^https?:\/\//i.test(href) &&
      !href.includes("[ROOT]") &&
      !href.includes(directoryBasePath)
    ) {
      return match;
    }
    if (href.includes(directoryBasePath)) {
      if (href.startsWith("/")) {
        const adjustedHref = prependLangSlug(href, lang);
        return `href="${adjustedHref}"`;
      }
      if (!isDefaultLanguage(lang)) {
        return `href="${directoryBasePath}${lang}/${href.replace(
          directoryBasePath,
          ""
        )}"`;
      }
    }
    return match;
  });
  adjustedHtml = adjustedHtml.replace(/([^:])\/\//g, "$1/");
  return adjustedHtml;
}

function adjustMediaLinks(html, outputPath) {
  const directoryBasePath = calculateDirectoryBasePath(outputPath);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  document.querySelectorAll("link[rel=stylesheet]").forEach((link) => {
    let href = link.getAttribute("href");
    if (href && (href.includes("[ROOT]") || href.includes(directoryBasePath))) {
      href = href.replace(/\/[a-z]{2}\//, "/");
      href = href.replace("[ROOT]", directoryBasePath);
      href = href.replace(/([^:]\/)\/+/g, "$1");
      link.setAttribute("href", href);
    }
  });
  document.querySelectorAll("img[src]").forEach((img) => {
    let src = img.getAttribute("src");
    if (src && (src.includes("[ROOT]") || src.includes(directoryBasePath))) {
      src = src.replace(/\/[a-z]{2}\//, "/");
      src = src.replace("[ROOT]", directoryBasePath);
      src = src.replace(/([^:]\/)\/+/g, "$1");
      img.setAttribute("src", src);
    }
  });
  return dom.serialize();
}

function adjustScriptLinks(html, outputPath) {
  const directoryBasePath = calculateDirectoryBasePath(outputPath);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  document.querySelectorAll("script[src]").forEach((script) => {
    let src = script.getAttribute("src");
    if (src && src.includes("[ROOT]")) {
      src = src.replace("[ROOT]", directoryBasePath);
      src = src.replace(/([^:]\/)\/+/g, "$1");
      script.setAttribute("src", src);
    }
  });
  return dom.serialize();
}

function loadComponentWithoutReplace(
  componentName,
  lang,
  outputPath,
  isPrimaryLang
) {
  const componentPath = path.join(COMPONENTS_PATH, componentName, "index.html");
  if (!fs.existsSync(componentPath)) {
    console.error(`Missing component: ${componentName}`);
    return "";
  }
  const componentTemplate = fs.readFileSync(componentPath, "utf8");
  let html = componentTemplate;
  const dom = new JSDOM(`<div>${html}</div>`);
  const document = dom.window.document;
  const elements = document.querySelectorAll("*");
  elements.forEach((element) => {
    const newHtml = loadDesignSystemElement(
      element,
      lang,
      outputPath,
      isPrimaryLang
    );
    if (newHtml !== element.outerHTML) {
      const newDom = new JSDOM(newHtml);
      element.replaceWith(newDom.window.document.body.firstElementChild);
    }
  });
  html = dom.window.document.body.firstElementChild.innerHTML;
  // Pas d'ajustement des liens ici
  return html.trim();
}

function loadDesignSystemElement(
  element,
  lang,
  outputPath,
  isPrimaryLang,
  inheritedValues = {},
  parentElement = null
) {
  const classList = element.className ? element.className.split(/\s+/) : [];
  let elementPath;
  let matchedClass;
  for (const className of classList) {
    if (
      className.endsWith("-layout") &&
      designSystemLayoutClassToDir.has(className)
    ) {
      elementPath = path.join(
        DESIGN_SYSTEM_LAYOUTS_PATH,
        designSystemLayoutClassToDir.get(className),
        "index.html"
      );
      matchedClass = className;
      break;
    } else if (
      className.endsWith("-component") &&
      designSystemComponentClassToDir.has(className)
    ) {
      elementPath = path.join(
        DESIGN_SYSTEM_COMPONENTS_PATH,
        designSystemComponentClassToDir.get(className),
        "index.html"
      );
      matchedClass = className;
      break;
    } else if (
      className.endsWith("-template") &&
      designSystemTemplateClassToDir.has(className)
    ) {
      elementPath = path.join(
        DESIGN_SYSTEM_TEMPLATES_PATH,
        designSystemTemplateClassToDir.get(className),
        "index.html"
      );
      matchedClass = className;
      break;
    }
  }
  if (elementPath && fs.existsSync(elementPath)) {
    let elementHtml = fs.readFileSync(elementPath, "utf8");
    const elementDom = new JSDOM(elementHtml);
    const elementRoot = elementDom.window.document.body.firstElementChild;
    const pagePlaceholders =
      element.innerHTML.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/gs) || [];
    const pageValues = { ...inheritedValues };
    pagePlaceholders.forEach((placeholder) => {
      const match = placeholder.match(/\[([^\]]*)\]:\s*"(.*?)"\s*;/s);
      if (match) {
        const [, name, value] = match;
        pageValues[name] = value;
        console.log(`Placeholder [${name}] assigned value: ${value}`);
      } else {
        console.warn(`Invalid placeholder format: ${placeholder}`);
      }
    });
    let elementContent = elementRoot.innerHTML;
    Object.keys(pageValues).forEach((key) => {
      const value = pageValues[key];
      console.log(`Replacing placeholder [${key}] with value: ${value}`);
      elementContent = elementContent.replace(
        new RegExp(`\\[${key}\\]:\s*".*?"\\s*;`, "gs"),
        ""
      );
      const containsHtml = /<[a-z][\s\S]*>/i.test(value);
      if (containsHtml) {
        console.log(`Value for [${key}] contains HTML, inserting as raw HTML`);
        const tempDom = new JSDOM(`<div>${elementContent}</div>`);
        const tempDoc = tempDom.window.document;
        const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
        const matches = elementContent.match(placeholderRegex);
        if (matches) {
          elementContent = elementContent.replace(placeholderRegex, value);
        } else {
          console.warn(
            `Placeholder [${key}] not found in element content: ${elementContent}`
          );
        }
      } else {
        const placeholderRegex = new RegExp(`\\[${key}\\]`, "g");
        const matches = elementContent.match(placeholderRegex);
        if (matches) {
          elementContent = elementContent.replace(placeholderRegex, value);
        } else {
          console.warn(
            `Placeholder [${key}] not found in element content: ${elementContent}`
          );
        }
      }
    });
    const childDom = new JSDOM(`<div>${elementContent}</div>`);
    const childElements = childDom.window.document.querySelectorAll("*");
    childElements.forEach((childElement) => {
      const childClassName = childElement.className;
      if (
        (childClassName && childClassName.endsWith("-layout")) ||
        (childClassName && childClassName.endsWith("-component")) ||
        (childClassName && childClassName.endsWith("-template"))
      ) {
        const newChildHtml = loadDesignSystemElement(
          childElement,
          lang,
          outputPath,
          isPrimaryLang,
          pageValues,
          elementRoot
        );
        const newChildDom = new JSDOM(newChildHtml);
        childElement.replaceWith(
          newChildDom.window.document.body.firstElementChild
        );
      }
    });
    elementContent = childDom.window.document.body.firstElementChild.innerHTML;
    const iconDom = new JSDOM(`<div>${elementContent}</div>`);
    const iconElements = iconDom.window.document.querySelectorAll("img");
    iconElements.forEach((img) => {
      const className = img.className;
      if (iconClassToAttributes.has(className)) {
        const { src, alt } = iconClassToAttributes.get(className);
        img.setAttribute("src", src);
        img.setAttribute("alt", alt);
      }
    });
    elementContent = iconDom.window.document.body.firstElementChild.innerHTML;
    const finalDom = new JSDOM(`<div>${elementContent}</div>`);
    const allElements = finalDom.window.document.querySelectorAll("*");
    allElements.forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const attrValue = attr.value;
        Object.keys(pageValues).forEach((key) => {
          const value = pageValues[key];
          if (attrValue.includes(`[${key}]`)) {
            attr.value = attrValue.replace(
              new RegExp(`\\[${key}\\]`, "g"),
              value
            );
          }
        });
      });
    });
    elementContent = finalDom.window.document.body.firstElementChild.innerHTML;
    elementRoot.innerHTML = elementContent;
    elementRoot.className = element.className;
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name !== "class") {
        elementRoot.setAttribute(attr.name, attr.value);
      }
    });
    Array.from(elementRoot.attributes).forEach((attr) => {
      const attrValue = attr.value;
      Object.keys(pageValues).forEach((key) => {
        const value = pageValues[key];
        if (attrValue.includes(`[${key}]`)) {
          attr.value = attrValue.replace(
            new RegExp(`\\[${key}\\]`, "g"),
            value
          );
        }
      });
    });
    if (
      parentElement &&
      elementRoot.tagName.toLowerCase() !== element.tagName.toLowerCase()
    ) {
      Array.from(parentElement.attributes).forEach((attr) => {
        if (attr.name !== "class") {
          elementRoot.setAttribute(attr.name, attr.value);
        }
      });
    }
    return elementRoot.outerHTML; // Pas d'ajustement des liens ici
  }
  return element.outerHTML;
}

function findLayout(filePath) {
  const localLayoutPath = path.join(APP_PATH, filePath, "layout.js");
  if (fs.existsSync(localLayoutPath)) {
    return localLayoutPath;
  }
  let currentPath = path.dirname(path.join(APP_PATH, filePath));
  while (currentPath !== APP_PATH) {
    const layoutPath = path.join(currentPath, "layout.js");
    if (fs.existsSync(layoutPath)) {
      return layoutPath;
    }
    currentPath = path.dirname(currentPath);
  }
  const rootLayoutPath = path.join(APP_PATH, "layout.js");
  return fs.existsSync(rootLayoutPath) ? rootLayoutPath : null;
}

async function generateLayoutMap() {
  const pages = glob.sync("**/index.html", { cwd: APP_PATH });
  const layoutGroups = {};
  for (const page of pages) {
    const dirPath = path.dirname(page);
    const groupMatch = dirPath.match(/\(([^)]+)\)/);
    const groupLayout = groupMatch ? groupMatch[1] : "default";
    const cleanPath = `/${stripGroupsFromPath(dirPath)}`;
    if (!layoutGroups[groupLayout]) {
      const layoutPath = findLayout(cleanPath);
      let components = ["pageContent"];
      if (layoutPath) {
        const layoutModule = await import(pathToFileURL(layoutPath).href);
        components = layoutModule.default();
      }
      layoutGroups[groupLayout] = {
        group: groupLayout,
        components: components,
        pages: [],
      };
    }
    layoutGroups[groupLayout].pages.push(cleanPath);
  }
  const outputData = Object.values(layoutGroups);
  const outputPath = path.join(DIST_PATH, "layout-map.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`✅ layout-map.json généré à ${outputPath}`);
}

async function generatePage(filePath, lang, isPrimaryLang = false) {
  const baseHTML = fs.readFileSync(BASE_HTML, "utf8");
  const normalizedPath = stripGroupsFromPath(filePath);
  const resolvedPath = resolveFilePath(normalizedPath);
  if (!resolvedPath) {
    console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
    return;
  }
  const metaPath = path.join(resolvedPath, "meta.html");
  const contentPath = path.join(resolvedPath, "index.html");
  if (!fs.existsSync(contentPath)) {
    console.error(`❌ Erreur : index.html introuvable pour ${filePath}`);
    return;
  }
  let localePath = path.join(
    LOCALES_PATH,
    "pages",
    normalizedPath,
    `${lang}.json`
  );
  if (!fs.existsSync(localePath)) {
    console.warn(
      `⚠️ Avertissement : Pas de traduction trouvée pour ${filePath} en ${lang}`
    );
    localePath = null;
  }
  let metaContent = fs.existsSync(metaPath)
    ? fs.readFileSync(metaPath, "utf8").trim()
    : "";
  let pageContent = fs.readFileSync(contentPath, "utf8").trim();
  const cleanFilePath = stripGroupsFromPath(filePath);
  const localizedUrl = isPrimaryLang
    ? `${baseUrl}/${cleanFilePath === "index" ? "" : cleanFilePath}`
    : `${baseUrl}/${lang}/${cleanFilePath === "index" ? "" : cleanFilePath}`;
  metaContent = metaContent.replace(/\{\{og:url\}\}/g, localizedUrl);
  pageContent = pageContent.replace(/\{\{og:url\}\}/g, localizedUrl);
  const layoutPath = findLayout(filePath);
  let layout = ["pageContent"];
  if (layoutPath) {
    const layoutModule = await import(pathToFileURL(layoutPath).href);
    layout = layoutModule.default();
  }
  const cleanOutputPath = stripGroupsFromPath(filePath).replace(/\/+/g, "/");
  const outputPath = isPrimaryLang
    ? path.join(
        DIST_PATH,
        cleanOutputPath === "index"
          ? "index.html"
          : `${cleanOutputPath}/index.html`
      )
    : path
        .join(
          DIST_PATH,
          lang,
          cleanOutputPath === "index"
            ? "index.html"
            : `${cleanOutputPath}/index.html`
        )
        .replace(/\/+/g, "/");
  const dom = new JSDOM(pageContent);
  const document = dom.window.document;
  const elements = document.querySelectorAll("*");
  elements.forEach((element) => {
    const newHtml = loadDesignSystemElement(
      element,
      lang,
      outputPath,
      isPrimaryLang
    );
    if (newHtml !== element.outerHTML) {
      const newDom = new JSDOM(newHtml);
      element.replaceWith(newDom.window.document.body.firstElementChild);
    }
  });
  const iconElements = document.querySelectorAll("img");
  iconElements.forEach((img) => {
    const className = img.className;
    if (iconClassToAttributes.has(className)) {
      const { src, alt } = iconClassToAttributes.get(className);
      img.setAttribute("src", src);
      img.setAttribute("alt", alt);
      console.log(
        `Icône autonome traitée : ${className} -> src="${src}", alt="${alt}"`
      );
    }
  });
  pageContent = dom.serialize();
  // Pas d'ajustement des liens ici
  const componentsHTML = layout
    .map((component) =>
      component === "pageContent"
        ? `<div id="pageContent">${pageContent}</div>`
        : loadComponentWithoutReplace(
            component,
            lang,
            outputPath,
            isPrimaryLang
          )
    )
    .join("\n");
  const baseDom = new JSDOM(baseHTML);
  baseDom.window.document.documentElement.lang = lang;
  let adjustedHTML = baseDom.serialize();
  const adjustedDOM = new JSDOM(adjustedHTML);
  const headContentElement = adjustedDOM.window.document.querySelector(
    ".custom-head-content"
  );
  if (headContentElement) {
    const head = adjustedDOM.window.document.querySelector("head");
    headContentElement.outerHTML = "";
    head.insertAdjacentHTML("beforeend", metaContent);
  }
  const slotElement = adjustedDOM.window.document.querySelector("slot");
  if (slotElement) {
    slotElement.outerHTML = componentsHTML.trim();
  }
  let finalHtml = adjustedDOM.serialize();
  let mergedTranslations = {};
  layout.forEach((component) => {
    if (component !== "pageContent") {
      const compLocalePath = path.join(
        LOCALES_PATH,
        "frames",
        component,
        `${lang}.json`
      );
      if (fs.existsSync(compLocalePath)) {
        const compTranslations = readJSON(compLocalePath);
        Object.assign(mergedTranslations, compTranslations);
      }
    }
  });
  if (localePath) {
    const pageTranslations = readJSON(localePath);
    Object.assign(mergedTranslations, pageTranslations);
  }
  finalHtml = replacePlaceholders(finalHtml, mergedTranslations);
  finalHtml = adjustLinks(finalHtml, outputPath, lang);
  finalHtml = adjustMediaLinks(finalHtml, outputPath);
  finalHtml = adjustScriptLinks(finalHtml, outputPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, finalHtml);
  console.log(`✅ Génération réussie : ${outputPath}`);
}

async function buildSite() {
  await updateRouterLanguages();
  cleanDist();
  copyAllScss();
  console.log("Building styles...");
  try {
    const { stdout, stderr } = await execAsync("npm run build:styles:min");
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error(`Error during styles build: ${error.message}`);
    throw error;
  }
  copyFolder(path.resolve("assets"), path.join(DIST_PATH, "assets"));
  copyFolder(path.resolve("js"), path.join(DIST_PATH, "js"));
  copyFolder(path.resolve("lib"), path.join(DIST_PATH, "lib"));
  copyFolder(path.resolve("modals"), path.join(DIST_PATH, "modals"));
  copyFolder(path.resolve("config"), path.join(DIST_PATH, "config"));
  collectDesignSystemClassNames();
  const pages = glob
    .sync("**/index.html", { cwd: APP_PATH })
    .map((file) => path.dirname(file));
  for (const page of pages) {
    for (const lang of availableLanguages) {
      const isPrimaryLang = isDefaultLanguage(lang);
      await generatePage(page, lang, isPrimaryLang);
    }
  }
  generateLayoutMap();
}

buildSite();
