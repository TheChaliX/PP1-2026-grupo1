// login.js — PP1 2026 Grupo 1

const API_AUTH_URL = "http://localhost:8080/api/auth";

const formLogin     = document.querySelector("#formLogin");
const inputEmail    = document.querySelector("#email");
const inputPassword = document.querySelector("#password");
const errEmail      = document.querySelector("#err-email");
const errPassword   = document.querySelector("#err-password");
const botonLogin    = formLogin ? formLogin.querySelector(".btn-auth") : null;

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

function setEnviando(enviando) {
  if (botonLogin) botonLogin.disabled = enviando;
}

if (formLogin) {
  formLogin.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    const email    = inputEmail.value.trim();
    const password = inputPassword.value;
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

    setEnviando(true);
    let ingreso = false;

    try {
      const respuesta = await fetch(`${API_AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (respuesta.status === 401) {
        marcarError(inputPassword, errPassword, "Correo o contraseña incorrectos.");
        return;
      }
      if (respuesta.status === 400) {
        mostrarModal("Revisá los datos ingresados.", "error");
        return;
      }
      if (!respuesta.ok) {
        throw new Error("Respuesta inesperada del servidor: " + respuesta.status);
      }

      const usuario = await respuesta.json();
      iniciarSesion(usuario);
      ingreso = true;

      mostrarModal("¡Sesión iniciada! Redirigiendo...", "exito");

      setTimeout(() => {
        if (usuario.rol === "anfitrion") {
          window.location.href = "mis-propiedades.html";
        } else {
          window.location.href = "catalogo.html";
        }
      }, 1200);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      mostrarModal("No se pudo iniciar sesión. Verificá que el servidor esté en funcionamiento e intentá de nuevo.", "error");
    } finally {
      if (!ingreso) setEnviando(false);
    }
  });
}