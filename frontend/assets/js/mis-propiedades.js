// mis-propiedades.js — PP1 2026 Grupo 1

requerirSesion("anfitrion");

document.querySelectorAll(".btn-retirar").forEach((btn) => {
  btn.addEventListener("click", function () {
    const card  = this.closest(".propiedad-card");
    const badge = card.querySelector(".badge-estado");
    if (!badge) return;

    const estaPublicada = badge.textContent.trim() === "Publicada";

    if (estaPublicada) {
      if (confirm("¿Querés retirar esta propiedad del catálogo?")) {
        badge.textContent = "Retirada";
        badge.className   = "badge-estado cancelado";
        this.innerHTML    = `<i class="bi bi-arrow-counterclockwise"></i> Reactivar`;
        mostrarModal("Propiedad retirada del catálogo correctamente.", "exito");
      }
    } else {
      badge.textContent = "Publicada";
      badge.className   = "badge-estado confirmado";
      this.innerHTML    = `<i class="bi bi-x-circle"></i> Retirar`;
      mostrarModal("¡Propiedad reactivada en el catálogo!", "exito");
    }
  });
});
