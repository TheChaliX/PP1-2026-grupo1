
const registerForm = document.querySelector("#registerForm");
const inputFullName = document.querySelector("#fullName");
const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const inputConfirmPassword = document.querySelector("#confirmPassword");
const mensajeError = document.querySelector("#mensajeError");

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


registerForm.addEventListener("submit", function (evento) {
  evento.preventDefault();

  mensajeError.textContent = "";
  mensajeError.style.color = "red";

  const nombre = inputFullName.value.trim();
  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();
  const confirmPassword = inputConfirmPassword.value.trim();

  
  if (!nombre || !email || !password || !confirmPassword) {
    mensajeError.textContent = "Por favor, completá todos los campos.";
    return;
  }

  
  if (!regexEmail.test(email)) {
    mensajeError.textContent = "Ingresá un correo electrónico válido.";
    return;
  }

  
  if (password.length < 8) {
    mensajeError.textContent = "La contraseña debe tener al menos 8 caracteres.";
    return;
  }

  
  if (password !== confirmPassword) {
    mensajeError.textContent = "Las contraseñas no coinciden.";
    return;
  }

  
  mensajeError.style.color = "green";
  mensajeError.textContent = "¡Cuenta creada exitosamente! Redirigiendo a login...";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});