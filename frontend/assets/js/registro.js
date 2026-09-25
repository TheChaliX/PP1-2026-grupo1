// registro.js — PP1 2026 Grupo 1

const registerForm          = document.querySelector("#registerForm");
const inputFullName         = document.querySelector("#fullName");
const inputEmail            = document.querySelector("#email");
const inputPassword         = document.querySelector("#password");
const inputConfirmPassword  = document.querySelector("#confirmPassword");

const errNombre          = document.querySelector("#err-nombre");
const errEmail           = document.querySelector("#err-email");
const errPassword        = document.querySelector("#err-password");
const errConfirmPassword = document.querySelector("#err-confirmPassword");

function limpiarErrores() {
  [errNombre, errEmail, errPassword, errConfirmPassword].forEach((el) => {
    if (el) el.textContent = "";
  });
  [inputFullName, inputEmail, inputPassword, inputConfirmPassword].forEach((el) => {
    if (el) el.classList.remove("input-invalido");
  });
}

function marcarError(input, errSpan, mensaje) {
  if (input)   input.classList.add("input-invalido");
  if (errSpan) errSpan.textContent = mensaje;
}

if (registerForm) {
  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    const nombre          = inputFullName.value.trim();
    const email           = inputEmail.value.trim();
    const password        = inputPassword.value.trim();
    const confirmPassword = inputConfirmPassword.value.trim();

    let hayError = false;

    if (!nombre) {
      marcarError(inputFullName, errNombre, "Ingresá tu nombre completo.");
      hayError = true;
    }
    if (!email) {
      marcarError(inputEmail, errEmail, "El email es obligatorio.");
      hayError = true;
    }
    if (!password) {
      marcarError(inputPassword, errPassword, "La contraseña es obligatoria.");
      hayError = true;
    }
    if (!confirmPassword) {
      marcarError(inputConfirmPassword, errConfirmPassword, "Repetí tu contraseña.");
      hayError = true;
    } else if (password !== confirmPassword) {
      marcarError(inputConfirmPassword, errConfirmPassword, "Las contraseñas no coinciden.");
      hayError = true;
    }

    if (hayError) return;

    mostrarModal("¡Cuenta creada exitosamente! Redirigiendo al login...", "exito");
    setTimeout(() => { window.location.href = "login.html"; }, 1400);
  });
}
