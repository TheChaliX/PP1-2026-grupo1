// publicar-alojamiento.js — Frontend Mockup PP1 2026
const formPublicar      = document.querySelector("#formPublicar");
const inputNombre       = document.querySelector("#nombre");
const inputDescripcion  = document.querySelector("#descripcion");
const inputUbicacion    = document.querySelector("#ubicacion");
const selectTipo        = document.querySelector("#tipo");
const inputPrecio       = document.querySelector("#precioNoche");

function limpiarErrores() {
  document.querySelectorAll(".campo-error").forEach(el => el.textContent = "");
  document.querySelectorAll(".input-invalido").forEach(el => el.classList.remove("input-invalido"));
}

function marcarError(input, idError, mensaje) {
  if (input) input.classList.add("input-invalido");
  const errSpan = document.querySelector("#" + idError);
  if (errSpan) errSpan.textContent = mensaje;
}

if (formPublicar) {
  formPublicar.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    let hayError = false;

    if (!inputNombre.value.trim()) {
      marcarError(inputNombre, "err-nombre", "El nombre es obligatorio.");
      hayError = true;
    }
    if (!inputDescripcion.value.trim()) {
      marcarError(inputDescripcion, "err-descripcion", "Describí el alojamiento.");
      hayError = true;
    }
    if (!inputUbicacion.value.trim()) {
      marcarError(inputUbicacion, "err-ubicacion", "La ubicación es obligatoria.");
      hayError = true;
    }
    if (!selectTipo.value) {
      marcarError(selectTipo, "err-tipo", "Seleccioná el tipo de alojamiento.");
      hayError = true;
    }
    if (!inputPrecio.value || Number(inputPrecio.value) <= 0) {
      marcarError(inputPrecio, "err-precio", "El precio debe ser mayor a 0.");
      hayError = true;
    }

    if (hayError) {
      mostrarModal("Hay campos con errores. Corregílos antes de publicar.", "error");
      return;
    }

    mostrarModal("¡Alojamiento enviado para revisión! Redirigiendo...", "exito");
    formPublicar.reset();
    setTimeout(() => { window.location.href = "mis-propiedades.html"; }, 1500);
  });
}
