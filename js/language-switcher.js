document.addEventListener("DOMContentLoaded", () => {
  const languageButtons = document.querySelectorAll(".language-button");
  const languagePopups = document.querySelectorAll(".language-popup");
  const currentLanguageSpans = document.querySelectorAll(".current-language");
  const languageOptions = document.querySelectorAll(".language-option");

  const currentPath = window.location.pathname;
  const langRegex = /^\/([a-z]{2})(\/|$)/;
  const currentLangMatch = currentPath.match(langRegex);
  const currentLang = currentLangMatch ? currentLangMatch[1] : "en";

  currentLanguageSpans.forEach((span) => {
    span.textContent = currentLang.toUpperCase();
  });

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

  languageOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedLang = option.dataset.lang;

      sessionStorage.setItem("manualLangSelected", "true");

      currentLanguageSpans.forEach((span) => {
        span.textContent = selectedLang.toUpperCase();
      });

      let newPath = currentPath;
      if (currentLang !== selectedLang) {
        if (currentLangMatch) {
          newPath = currentPath.replace(langRegex, `/${selectedLang}/`);
        } else {
          newPath = `/${selectedLang}${currentPath}`;
        }
      }

      newPath = newPath.replace(/\/\//g, "/");

      window.location.href = newPath;
    });
  });
});
