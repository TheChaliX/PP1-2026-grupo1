
const formLogin = document.querySelector("#formLogin");
const inputEmail = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const mensajeError = document.querySelector("#mensajeError");


const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


formLogin.addEventListener("submit", function (evento) {
  // Previene que la página se recargue al enviar el formulario (Clase 17)
  evento.preventDefault();

  mensajeError.textContent = "";
  mensajeError.style.color = "red";

  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  
  if (email === "" || password === "") {
    mensajeError.textContent = "Por favor, completá todos los campos.";
    return;
  }

  
  if (!regexEmail.test(email)) {
    mensajeError.textContent = "Ingresá un correo electrónico válido.";
    return;
  }

 
  if (password.length < 6) {
    mensajeError.textContent = "La contraseña debe tener al menos 6 caracteres.";
    return;
  }

  
  mensajeError.style.color = "green";
  mensajeError.textContent = "¡Inicio de sesión exitoso! Redirigiendo...";


  setTimeout(() => {
    window.location.href = "reservas.html";
  }, 1500);
});