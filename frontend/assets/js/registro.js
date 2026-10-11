// registro.js — PP1 2026 Grupo 1

const API_AUTH_URL = "http://localhost:8080/api/auth";

const registerForm         = document.querySelector("#registerForm");
const inputNombre          = document.querySelector("#nombre");
const inputApellido        = document.querySelector("#apellido");
const inputEmail           = document.querySelector("#email");
const inputPassword        = document.querySelector("#password");
const inputConfirmPassword = document.querySelector("#confirmPassword");
const botonRegistro        = registerForm ? registerForm.querySelector(".btn-auth") : null;

const errNombre          = document.querySelector("#err-nombre");
const errApellido        = document.querySelector("#err-apellido");
const errEmail           = document.querySelector("#err-email");
const errPassword        = document.querySelector("#err-password");
const errConfirmPassword = document.querySelector("#err-confirmPassword");

function limpiarErrores() {
  [errNombre, errApellido, errEmail, errPassword, errConfirmPassword].forEach((el) => {
    if (el) el.textContent = "";
  });

  [inputNombre, inputApellido, inputEmail, inputPassword, inputConfirmPassword].forEach((el) => {
    if (el) el.classList.remove("input-invalido");
  });
}

function marcarError(input, errSpan, mensaje) {
  if (input)   input.classList.add("input-invalido");
  if (errSpan) errSpan.textContent = mensaje;
}

function emailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setEnviando(enviando) {
  if (botonRegistro) botonRegistro.disabled = enviando;
}

if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    const nombre          = inputNombre.value.trim();
    const apellido        = inputApellido.value.trim();
    const email           = inputEmail.value.trim();
    const password        = inputPassword.value;
    const confirmPassword = inputConfirmPassword.value;
    const rolElegido      = registerForm.querySelector('input[name="rol"]:checked');
    const rol             = rolElegido ? rolElegido.value : "huesped";

    let hayError = false;

    if (!nombre) {
      marcarError(inputNombre, errNombre, "Ingresá tu nombre.");
      hayError = true;
    }
    if (!apellido) {
      marcarError(inputApellido, errApellido, "Ingresá tu apellido.");
      hayError = true;
    }
    if (!email) {
      marcarError(inputEmail, errEmail, "El email es obligatorio.");
      hayError = true;
    } else if (!emailValido(email)) {
      marcarError(inputEmail, errEmail, "Ingresá un email válido.");
      hayError = true;
    }
    if (!password) {
      marcarError(inputPassword, errPassword, "La contraseña es obligatoria.");
      hayError = true;
    } else if (password.length < 8) {
      marcarError(inputPassword, errPassword, "La contraseña debe tener al menos 8 caracteres.");
      hayError = true;
    } else if (password.length > 72) {
      marcarError(inputPassword, errPassword, "La contraseña puede tener hasta 72 caracteres.");
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

    setEnviando(true);
    let cuentaCreada = false;

    try {
      const respuesta = await fetch(`${API_AUTH_URL}/registro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, email, password, rol })
      });

      if (respuesta.status === 409) {
        marcarError(inputEmail, errEmail, "Ya existe una cuenta con ese email.");
        return;
      }
      if (respuesta.status === 400) {
        mostrarModal("Revisá los datos ingresados.", "error");
        return;
      }
      if (!respuesta.ok) {
        throw new Error("Respuesta inesperada del servidor: " + respuesta.status);
      }

      cuentaCreada = true;
      mostrarModal("¡Cuenta creada exitosamente! Redirigiendo al login...", "exito");
      setTimeout(() => { window.location.href = "login.html"; }, 1400);
    } catch (error) {
      console.error("Error al registrar:", error);
      mostrarModal("No se pudo crear la cuenta. Verificá que el servidor esté en funcionamiento e intentá de nuevo.", "error");
    } finally {
      if (!cuentaCreada) setEnviando(false);
    }
  });
}