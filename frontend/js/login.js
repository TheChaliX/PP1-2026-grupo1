// 1. Referencias al DOM
const formLogin = document.querySelector("#formLogin");
const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const mensajeError = document.querySelector("#mensajeError");

// 2. Expresión regular para validar el formato de correo
const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 3. Listener del evento Submit
formLogin.addEventListener("submit", function (evento) {
  // Previene que la página se recargue al enviar el formulario (Clase 17)
  evento.preventDefault();

  // Limpiamos mensajes de error previos
  mensajeError.textContent = "";
  mensajeError.style.color = "red";

  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  // Validación 1: Campos vacíos
  if (email === "" || password === "") {
    mensajeError.textContent = "Por favor, completá todos los campos.";
    return;
  }

  // Validación 2: Formato de Email correcto
  if (!regexEmail.test(email)) {
    mensajeError.textContent = "Ingresá un correo electrónico válido.";
    return;
  }

  // Validación 3: Largo mínimo de contraseña
  if (password.length < 6) {
    mensajeError.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  // Si todas las validaciones pasan con éxito
  mensajeError.style.color = "green";
  mensajeError.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";

  // Simulación de ingreso al sistema
  setTimeout(() => {
    window.location.href = "reservas.html";
  }, 1500);
});