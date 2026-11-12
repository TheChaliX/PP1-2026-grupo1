// recuperar.js
// como no mandamos mails, el codigo se muestra en pantalla

const API_AUTH_URL = `${API_BASE}/auth`;
const regexEmail   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formRecuperar   = document.getElementById("formRecuperar");
const formRestablecer = document.getElementById("formRestablecer");
const textoPaso       = document.getElementById("textoPaso");
const codigoGenerado  = document.getElementById("codigoGenerado");

const inputEmail    = document.getElementById("email");
const inputCodigo   = document.getElementById("codigo");
const inputPassword = document.getElementById("password");
const inputConfirm  = document.getElementById("confirmPassword");

let emailRecuperacion = "";

function limpiarErrores() {
  document.querySelectorAll(".campo-error").forEach((el) => { el.textContent = ""; });
  document.querySelectorAll(".input-invalido").forEach((el) => el.classList.remove("input-invalido"));
}

function marcarError(input, idError, mensaje) {
  if (input) input.classList.add("input-invalido");
  const span = document.getElementById(idError);
  if (span) span.textContent = mensaje;
}

// paso 1: pedir el codigo
if (formRecuperar) {
  formRecuperar.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    const email = inputEmail.value.trim();
    if (!email) {
      marcarError(inputEmail, "err-email", "El email es obligatorio.");
      return;
    }
    if (!regexEmail.test(email)) {
      marcarError(inputEmail, "err-email", "Ingresá un email válido (ej: usuario@mail.com).");
      return;
    }

    const boton = formRecuperar.querySelector("button[type='submit']");
    boton.disabled = true;

    try {
      const respuesta = await fetch(`${API_AUTH_URL}/recuperar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        marcarError(inputEmail, "err-email", datos.mensaje || "No se pudo generar el código.");
        return;
      }

      emailRecuperacion = email;
      codigoGenerado.textContent = datos.codigo;
      formRecuperar.style.display = "none";
      formRestablecer.style.display = "block";
      if (textoPaso) textoPaso.textContent = `Elegí una contraseña nueva para ${email}`;
      inputCodigo.focus();
    } catch (error) {
      console.error("Error al pedir el código:", error);
      mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
    } finally {
      boton.disabled = false;
    }
  });
}

// paso 2: cambiar la contraseña
if (formRestablecer) {
  formRestablecer.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    const codigo   = inputCodigo.value.trim();
    const password = inputPassword.value;
    const confirm  = inputConfirm.value;
    let hayError = false;

    if (!/^\d{6}$/.test(codigo)) {
      marcarError(inputCodigo, "err-codigo", "El código tiene 6 números.");
      hayError = true;
    }
    if (password.length < 8 || password.length > 72) {
      marcarError(inputPassword, "err-password", "La contraseña debe tener entre 8 y 72 caracteres.");
      hayError = true;
    }
    if (password !== confirm) {
      marcarError(inputConfirm, "err-confirmPassword", "Las contraseñas no coinciden.");
      hayError = true;
    }
    if (hayError) return;

    const boton = formRestablecer.querySelector("button[type='submit']");
    boton.disabled = true;
    let cambiada = false;

    try {
      const respuesta = await fetch(`${API_AUTH_URL}/restablecer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailRecuperacion, codigo, password })
      });
      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        marcarError(inputCodigo, "err-codigo", datos.mensaje || "No se pudo cambiar la contraseña.");
        return;
      }

      cambiada = true;
      mostrarModal("¡Contraseña actualizada! Ya podés iniciar sesión.", "exito");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
    } finally {
      if (!cambiada) boton.disabled = false;
    }
  });
}
