// recuperar.js — PP1 2026 Grupo 1

const formRecuperar   = document.getElementById("formRecuperar");
const inputEmail      = document.getElementById("email");
const errEmail        = document.getElementById("err-email");
const mensajeEnviado  = document.getElementById("mensajeEnviado");

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function limpiarErrores() {
  if (errEmail)   errEmail.textContent = "";
  if (inputEmail) inputEmail.classList.remove("input-invalido");
}

function marcarError(msg) {
  if (inputEmail) inputEmail.classList.add("input-invalido");
  if (errEmail)   errEmail.textContent = msg;
}

if (formRecuperar) {
  formRecuperar.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    const email = inputEmail.value.trim();

    if (!email) {
      marcarError("El email es obligatorio.");
      return;
    }

    if (!regexEmail.test(email)) {
      marcarError("Ingresá un email válido (ej: usuario@mail.com).");
      return;
    }

    // Simular envío (en el futuro el backend procesará esto)
    const btnSubmit = formRecuperar.querySelector("button[type='submit']");
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="bi bi-hourglass-split"></i> Enviando...`;

    setTimeout(() => {
      // Ocultar el formulario y mostrar el mensaje de éxito
      formRecuperar.style.display = "none";
      if (mensajeEnviado) mensajeEnviado.style.display = "block";
    }, 1200);
  });
}
