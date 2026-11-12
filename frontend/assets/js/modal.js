/**
 * modal.js - modal reutilizable
 * PP1 2026 - Grupo 1
 *
 * Uso:
 *   mostrarModal("Mensaje de error", "error")
 *   mostrarModal("Operación exitosa", "exito")
 */

function mostrarModal(mensaje, tipo = "error") {
  // borra el modal anterior si hay uno
  const anterior = document.querySelector(".modal-overlay");
  if (anterior) anterior.remove();

  const esError = tipo === "error";

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.innerHTML = `
    <div class="modal-caja modal-${tipo}">
      <div class="modal-icono">
        <i class="bi ${esError ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}"></i>
      </div>
      <p class="modal-mensaje"></p>
      <button class="modal-cerrar" aria-label="Cerrar">Aceptar</button>
    </div>
  `;

  document.body.appendChild(overlay);
    overlay.querySelector(".modal-mensaje").textContent = mensaje;

  // para que arranque la animacion
  requestAnimationFrame(() => overlay.classList.add("modal-visible"));

  const cerrar = () => {
    overlay.classList.remove("modal-visible");
    overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
  };

  overlay.querySelector(".modal-cerrar").addEventListener("click", cerrar);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) cerrar();
  });
  document.addEventListener(
    "keydown",
    (e) => { if (e.key === "Escape") cerrar(); },
    { once: true }
  );
}
