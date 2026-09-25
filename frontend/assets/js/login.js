// login.js — Frontend Mockup PP1 2026

const formLogin      = document.querySelector("#formLogin");
const inputEmail     = document.querySelector("#email");
const inputPassword  = document.querySelector("#password");
const selectRolMock  = document.querySelector("#rolMock"); // Nuevo selector
const errEmail       = document.querySelector("#err-email");
const errPassword    = document.querySelector("#err-password");

function limpiarErrores() {
  [errEmail, errPassword].forEach((el) => { if (el) el.textContent = ""; });
  [inputEmail, inputPassword].forEach((el) => {
    if (el) el.classList.remove("input-invalido");
  });
}

function marcarError(input, errSpan, mensaje) {
  if (input)   input.classList.add("input-invalido");
  if (errSpan) errSpan.textContent = mensaje;
}

if (formLogin) {
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    const email    = inputEmail.value.trim();
    const password = inputPassword.value.trim();
    let hayError   = false;

    if (!email) {
      marcarError(inputEmail, errEmail, "El email es obligatorio.");
      hayError = true;
    }

    if (!password) {
      marcarError(inputPassword, errPassword, "La contraseña es obligatoria.");
      hayError = true;
    }

    if (hayError) return;

    // Lógica mockup: lee directamente del selector de la interfaz
    const rol = selectRolMock.value;
    
    iniciarSesion(rol, email);
    
    mostrarModal(`¡Iniciando sesión como ${rol}!`, "exito");

    setTimeout(() => {
      if (rol === "anfitrion") {
        window.location.href = "mis-propiedades.html";
      } else {
        window.location.href = "catalogo.html";
      }
    }, 1200);
  });
}
