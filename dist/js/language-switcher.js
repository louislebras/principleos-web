// document.addEventListener("DOMContentLoaded", () => {
//   const languageButtons = document.querySelectorAll(".language-button");
//   const languagePopups = document.querySelectorAll(".language-popup");
//   const currentLanguageSpans = document.querySelectorAll(".current-language");
//   const languageOptions = document.querySelectorAll(".language-option");

//   // Détecter la langue actuelle via l'URL
//   const currentPath = window.location.pathname;
//   const langRegex = /^\/([a-z]{2})(\/|$)/; // Regex pour détecter /en/, /fr/, /es/, etc.
//   const currentLangMatch = currentPath.match(langRegex);
//   const currentLang = currentLangMatch ? currentLangMatch[1] : "en"; // Par défaut "en"

//   // Mettre à jour tous les boutons avec la langue détectée
//   currentLanguageSpans.forEach((span) => {
//     span.textContent = currentLang.toUpperCase();
//   });

//   // Gestion de l'ouverture/fermeture de chaque pop-up
//   languageButtons.forEach((button, index) => {
//     const popup = languagePopups[index]; // Associer chaque bouton à son popup

//     button.addEventListener("click", (event) => {
//       event.stopPropagation();

//       // Fermer toutes les autres popups avant d'ouvrir celle-ci
//       languagePopups.forEach((p) => p.classList.remove("visible"));

//       popup.classList.toggle("visible");
//     });

//     // Fermer la popup si on clique ailleurs
//     document.addEventListener("click", (event) => {
//       if (!popup.contains(event.target) && !button.contains(event.target)) {
//         popup.classList.remove("visible");
//       }
//     });
//   });

//   // Gestion du clic sur une option de langue
//   languageOptions.forEach((option) => {
//     option.addEventListener("click", () => {
//       const selectedLang = option.dataset.lang;

//       // Mettre à jour tous les boutons avec la langue sélectionnée
//       currentLanguageSpans.forEach((span) => {
//         span.textContent = selectedLang.toUpperCase();
//       });

//       // Rediriger vers l'URL avec la langue sélectionnée
//       let newPath = currentPath;

//       if (currentLang !== selectedLang) {
//         if (currentLangMatch) {
//           newPath = currentPath.replace(langRegex, `/${selectedLang}/`);
//         } else {
//           newPath = `/${selectedLang}${currentPath}`;
//         }
//       }

//       newPath = newPath.replace(/\/\//g, "/"); // Éviter les "//" dans l'URL
//       window.location.href = newPath;
//     });
//   });
// });
document.addEventListener("DOMContentLoaded", () => {
  const languageButtons = document.querySelectorAll(".language-button");
  const languagePopups = document.querySelectorAll(".language-popup");
  const currentLanguageSpans = document.querySelectorAll(".current-language");
  const languageOptions = document.querySelectorAll(".language-option");

  // Détecter la langue actuelle via l'URL
  const currentPath = window.location.pathname;
  const langRegex = /^\/([a-z]{2})(\/|$)/;
  const currentLangMatch = currentPath.match(langRegex);
  const currentLang = currentLangMatch ? currentLangMatch[1] : "en";

  // Mettre à jour les boutons avec la langue détectée
  currentLanguageSpans.forEach((span) => {
    span.textContent = currentLang.toUpperCase();
  });

  // Gestion de l'ouverture/fermeture des pop-ups
  languageButtons.forEach((button, index) => {
    const popup = languagePopups[index];
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      languagePopups.forEach((p) => p.classList.remove("visible"));
      popup.classList.toggle("visible");
    });

    document.addEventListener("click", (event) => {
      if (!popup.contains(event.target) && !button.contains(event.target)) {
        popup.classList.remove("visible");
      }
    });
  });

  // Gestion du clic sur une option de langue
  languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedLang = option.dataset.lang;

      // Indiquer qu'une langue a été sélectionnée manuellement
      sessionStorage.setItem("manualLangSelected", "true");

      // Mettre à jour les boutons avec la langue sélectionnée
      currentLanguageSpans.forEach((span) => {
        span.textContent = selectedLang.toUpperCase();
      });

      // Construire la nouvelle URL
      let newPath = currentPath;
      if (currentLang !== selectedLang) {
        if (currentLangMatch) {
          newPath = currentPath.replace(langRegex, `/${selectedLang}/`);
        } else {
          newPath = `/${selectedLang}${currentPath}`;
        }
      }

      newPath = newPath.replace(/\/\//g, "/");

      // Forcer un rechargement complet de la page
      window.location.href = newPath;
    });
  });
});
