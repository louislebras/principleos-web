// import {
//   availableLanguages,
//   getDefaultLanguage,
//   isLanguageAvailable,
// } from "../config/config-app.js"; // Import des données et fonctions nécessaires

// document.addEventListener("DOMContentLoaded", () => {
//   const userLang = navigator.language || navigator.userLanguage;
//   const langPrefix = userLang.split("-")[0];

//   const targetLang = isLanguageAvailable(langPrefix)
//     ? langPrefix
//     : getDefaultLanguage(); // Utilisation des fonctions importées

//   const currentPath = window.location.pathname;
//   const isLocal =
//     window.location.hostname === "localhost" ||
//     /^[0-9.]+$/.test(window.location.hostname);

//   // Utilisation de sessionStorage pour ne rediriger qu'une fois
//   const alreadyRedirected = sessionStorage.getItem("langRedirected");

//   if (!alreadyRedirected) {
//     if (isLocal) {
//       const distIndex = currentPath.indexOf("/dist/");
//       if (distIndex !== -1) {
//         const pathAfterDist = currentPath.substring(distIndex + 6);

//         const langInPath = availableLanguages.some((lang) =>
//           pathAfterDist.startsWith(`${lang}/`)
//         );

//         if (!langInPath && targetLang !== getDefaultLanguage()) {
//           const newPath = `/dist/${targetLang}/${pathAfterDist}`;
//           sessionStorage.setItem("langRedirected", "true"); // Marquer comme redirigé
//           window.location.replace(newPath);
//         }
//       }
//     } else {
//       const isLangPath = availableLanguages.some((lang) =>
//         currentPath.startsWith(`/${lang}`)
//       );

//       if (!isLangPath && targetLang !== getDefaultLanguage()) {
//         const newPath = `/${targetLang}${
//           currentPath.startsWith("/") ? currentPath : "/" + currentPath
//         }`;
//         sessionStorage.setItem("langRedirected", "true"); // Marquer comme redirigé
//         window.location.replace(newPath);
//       }
//     }
//   }
// });

import {
  availableLanguages,
  getDefaultLanguage,
  isLanguageAvailable,
} from "../config/config-app.js";

document.addEventListener("DOMContentLoaded", () => {
  const userLang = navigator.language || navigator.userLanguage;
  const langPrefix = userLang.split("-")[0];

  const targetLang = isLanguageAvailable(langPrefix)
    ? langPrefix
    : getDefaultLanguage();

  const currentPath = window.location.pathname;
  const isLocal =
    window.location.hostname === "localhost" ||
    /^[0-9.]+$/.test(window.location.hostname);

  const alreadyRedirected = sessionStorage.getItem("langRedirected");
  const manualLangSelected = sessionStorage.getItem("manualLangSelected");

  // Ne rediriger automatiquement que si aucune langue n'a été sélectionnée manuellement
  if (!alreadyRedirected && !manualLangSelected) {
    if (isLocal) {
      const distIndex = currentPath.indexOf("/dist/");
      if (distIndex !== -1) {
        const pathAfterDist = currentPath.substring(distIndex + 6);
        const langInPath = availableLanguages.some((lang) =>
          pathAfterDist.startsWith(`${lang}/`)
        );

        if (!langInPath && targetLang !== getDefaultLanguage()) {
          const newPath = `/dist/${targetLang}/${pathAfterDist}`;
          sessionStorage.setItem("langRedirected", "true");
          window.location.replace(newPath);
        }
      }
    } else {
      const isLangPath = availableLanguages.some((lang) =>
        currentPath.startsWith(`/${lang}`)
      );

      if (!isLangPath && targetLang !== getDefaultLanguage()) {
        const newPath = `/${targetLang}${
          currentPath.startsWith("/") ? currentPath : "/" + currentPath
        }`;
        sessionStorage.setItem("langRedirected", "true");
        window.location.replace(newPath);
      }
    }
  }
});
