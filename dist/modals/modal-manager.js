document.addEventListener("DOMContentLoaded", () => {
  const modalRoot = document.querySelector("#modals-root");

  if (!modalRoot) {
    console.error("[MODAL] #modals-root non trouvé.");
    return;
  }

  function openModal(modalName) {
    console.log(`[MODAL] Chargement de ${modalName}...`);

    fetch(`/modals/${modalName}/index.html`)
      .then((response) => {
        if (!response.ok) throw new Error("Modale introuvable.");
        return response.text();
      })
      .then((html) => {
        modalRoot.innerHTML = html;
        const modal = modalRoot.querySelector(".modal");

        if (!modal) {
          console.error("[MODAL] Structure de modal incorrecte.");
          return;
        }

        // Ajout de la classe pour l'apparition
        modal.classList.add("modal-open");

        // Gestion du clic en dehors (ajout après insertion)
        setTimeout(() => {
          document.addEventListener("click", closeOnOutsideClick);
        }, 100);

        // Vérifier si la modal a un script spécifique
        const scriptPath = `/modals/${modalName}/index.js`;
        fetch(scriptPath)
          .then((resp) => (resp.ok ? resp.text() : null))
          .then((scriptContent) => {
            if (scriptContent) {
              const script = document.createElement("script");
              script.textContent = scriptContent;
              document.body.appendChild(script);
            }
          });

        console.log(`[MODAL] ${modalName} chargée.`);
      })
      .catch((error) => console.error(`[MODAL] Erreur de chargement :`, error));
  }

  function closeModal() {
    const modal = modalRoot.querySelector(".modal");
    if (!modal) return;

    console.log("[MODAL] Fermeture de la modale.");

    // Animation de fermeture
    modal.classList.add("modal-closing");

    setTimeout(() => {
      modalRoot.innerHTML = "";
      document.removeEventListener("click", closeOnOutsideClick);
    }, 200);
  }

  function closeOnOutsideClick(event) {
    const modal = modalRoot.querySelector(".modal");
    if (!modal) return;

    const disableClose = modal.hasAttribute("data-disable-close");

    // Vérifie si le clic est en dehors de la modal
    if (!disableClose && !modal.contains(event.target)) {
      closeModal();
    }
  }

  // Gestion des boutons "ouvrir"
  document.addEventListener("click", (event) => {
    const openBtn = event.target.closest("[class^='open-modal-']");
    if (openBtn) {
      const modalName = openBtn.classList[0].replace("open-modal-", "");
      openModal(modalName);
    }
  });

  // Gestion des boutons "fermer" dans la modale
  modalRoot.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-modal")) {
      closeModal();
    }
  });
});
