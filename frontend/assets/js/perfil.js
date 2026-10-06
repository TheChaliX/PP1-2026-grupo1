// perfil.js — PP1 2026 Grupo 1

// Proteger ruta y cargar datos del usuario activo
const usuario = requerirSesion();
if (usuario) {
  const inputNombre = document.getElementById("nombre");
  const inputEmail  = document.getElementById("email");
  if (inputEmail)  inputEmail.value  = usuario.email  || "";
  if (inputNombre) inputNombre.value = usuario.nombre || "";
}

// ── Validación del formulario ──────────────────────────────────────────────
const formPerfil  = document.getElementById("formPerfil");
const inputNombre = document.getElementById("nombre");
const inputPass   = document.getElementById("password");
const inputPassC  = document.getElementById("password-confirm");
const errNombre   = document.getElementById("err-nombre");
const errPass     = document.getElementById("err-password");
const errPassC    = document.getElementById("err-password-confirm");

function limpiarErrores() {
  [errNombre, errPass, errPassC].forEach((el) => { if (el) el.textContent = ""; });
  [inputNombre, inputPass, inputPassC].forEach((el) => {
    if (el) el.classList.remove("input-invalido");
  });
}

function marcarError(input, errSpan, msg) {
  if (input)   input.classList.add("input-invalido");
  if (errSpan) errSpan.textContent = msg;
}

if (formPerfil) {
  formPerfil.addEventListener("submit", function (e) {
    e.preventDefault();
    limpiarErrores();

    let hayError = false;

    const nombre = inputNombre?.value.trim();
    const pass   = inputPass?.value.trim();
    const passC  = inputPassC?.value.trim();

    if (!nombre || nombre.length < 3) {
      marcarError(inputNombre, errNombre, "El nombre debe tener al menos 3 caracteres.");
      hayError = true;
    }

    // Validar contraseña solo si el usuario escribió algo
    if (pass || passC) {
      if (pass.length < 8) {
        marcarError(inputPass, errPass, "La nueva contraseña debe tener al menos 8 caracteres.");
        hayError = true;
      }
      if (pass !== passC) {
        marcarError(inputPassC, errPassC, "Las contraseñas no coinciden.");
        hayError = true;
      }
    }

    if (hayError) return;

    mostrarModal("¡Datos actualizados con éxito!", "exito");
  });
}
