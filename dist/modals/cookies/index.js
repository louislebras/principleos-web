(function () {
  console.log("[COOKIES] Script exécuté, initialisation des listeners.");

  const acceptBtn = document.querySelector(".accept-cookies");
  const refuseBtn = document.querySelector(".refuse-cookies");

  console.log("[COOKIES] Recherche des boutons...");
  if (acceptBtn) {
    console.log("[COOKIES] Bouton accepter trouvé.");
    acceptBtn.addEventListener("click", () => {
      console.log("[COOKIES] Bouton accepter cliqué.");
      localStorage.setItem("cookieConsent", "accepted");
      if (typeof window.closeModal === "function") {
        window.closeModal("cookies");
        console.log("[COOKIES] Fermeture demandée.");
      } else {
        console.error("[COOKIES] window.closeModal non disponible.");
      }
    });
  } else {
    console.error("[COOKIES] Bouton accepter non trouvé.");
  }

  if (refuseBtn) {
    console.log("[COOKIES] Bouton refuser trouvé.");
    refuseBtn.addEventListener("click", () => {
      console.log("[COOKIES] Bouton refuser cliqué.");
      localStorage.setItem("cookieConsent", "refused");
      if (typeof window.closeModal === "function") {
        window.closeModal("cookies");
        console.log("[COOKIES] Fermeture demandée.");
      } else {
        console.error("[COOKIES] window.closeModal non disponible.");
      }
    });
  } else {
    console.error("[COOKIES] Bouton refuser non trouvé.");
  }
})();
