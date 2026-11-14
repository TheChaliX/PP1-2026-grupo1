/**
 * modal.js - modal reutilizable
 * PP1 2026 - Grupo 1
 *
 * Uso:
 *   mostrarModal("Mensaje de error", "error")
 *   mostrarModal("Operación exitosa", "exito")
 *   if (await confirmarModal("¿Seguro?", { textoConfirmar: "Eliminar" })) { ... }
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

// igual que mostrarModal pero con dos botones, devuelve true si confirma
function confirmarModal(mensaje, opciones = {}) {
  const {
    titulo = "¿Estás seguro?",
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar"
  } = opciones;

  const anterior = document.querySelector(".modal-overlay");
  if (anterior) anterior.remove();

  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "alertdialog");
    overlay.setAttribute("aria-modal", "true");

    overlay.innerHTML = `
      <div class="modal-caja modal-aviso">
        <div class="modal-icono">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h3 class="modal-titulo"></h3>
        <p class="modal-mensaje"></p>
        <div class="modal-botones">
          <button type="button" class="modal-cancelar"></button>
          <button type="button" class="modal-confirmar"></button>
        </div>
      </div>
    `;
    overlay.querySelector(".modal-titulo").textContent = titulo;
    overlay.querySelector(".modal-mensaje").textContent = mensaje;
    overlay.querySelector(".modal-cancelar").textContent = textoCancelar;
    overlay.querySelector(".modal-confirmar").textContent = textoConfirmar;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("modal-visible"));
    // el foco arranca en cancelar para no borrar algo sin querer
    overlay.querySelector(".modal-cancelar").focus();

    const cerrar = (respuesta) => {
      document.removeEventListener("keydown", teclas);
      overlay.classList.remove("modal-visible");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
      resolve(respuesta);
    };
    const teclas = (e) => { if (e.key === "Escape") cerrar(false); };

    overlay.querySelector(".modal-cancelar").addEventListener("click", () => cerrar(false));
    overlay.querySelector(".modal-confirmar").addEventListener("click", () => cerrar(true));
    overlay.addEventListener("click", (e) => { if (e.target === overlay) cerrar(false); });
    document.addEventListener("keydown", teclas);
  });
}
