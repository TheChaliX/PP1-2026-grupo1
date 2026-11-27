// perfil.js — guarda los cambios del perfil en el backend

const usuario = requerirSesion();

const formPerfil      = document.getElementById("formPerfil");
const inputNombre     = document.getElementById("nombre");
const inputApellido   = document.getElementById("apellido");
const inputEmail      = document.getElementById("email");
const inputPassActual = document.getElementById("password-actual");
const inputPass       = document.getElementById("password");
const inputPassC      = document.getElementById("password-confirm");

const errNombre      = document.getElementById("err-nombre");
const errApellido    = document.getElementById("err-apellido");
const errPassActual  = document.getElementById("err-password-actual");
const errPass        = document.getElementById("err-password");
const errPassC       = document.getElementById("err-password-confirm");

const campos  = [inputNombre, inputApellido, inputPassActual, inputPass, inputPassC];
const errores = [errNombre, errApellido, errPassActual, errPass, errPassC];

// carga los datos del usuario en el formulario
if (usuario) {
  inputNombre.value   = usuario.nombre   || "";
  inputApellido.value = usuario.apellido || "";
  inputEmail.value    = usuario.email    || "";
}

function limpiarErrores() {
  errores.forEach((el) => { if (el) el.textContent = ""; });
  campos.forEach((el) => { if (el) el.classList.remove("input-invalido"); });
}

function marcarError(input, errSpan, msg) {
  if (input)   input.classList.add("input-invalido");
  if (errSpan) errSpan.textContent = msg;
}

if (formPerfil && usuario) {
  formPerfil.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    if (!usuario.id) {
      mostrarModal("Volvé a iniciar sesión para guardar los cambios.", "error");
      return;
    }

    const nombre     = inputNombre.value.trim();
    const apellido   = inputApellido.value.trim();
    const passActual = inputPassActual.value;
    const passNueva  = inputPass.value;
    const passConf   = inputPassC.value;

    // la contraseña solo se valida si escribió algo en alguno de los tres campos
    const cambiaPass = passActual !== "" || passNueva !== "" || passConf !== "";

    let hayError = false;

    if (nombre.length < 2) {
      marcarError(inputNombre, errNombre, "El nombre debe tener al menos 2 caracteres.");
      hayError = true;
    }

    if (apellido.length < 2) {
      marcarError(inputApellido, errApellido, "El apellido debe tener al menos 2 caracteres.");
      hayError = true;
    }

    if (cambiaPass) {
      if (!passActual) {
        marcarError(inputPassActual, errPassActual, "Ingresá tu contraseña actual.");
        hayError = true;
      }
      if (passNueva.length < 8) {
        marcarError(inputPass, errPass, "La nueva contraseña debe tener al menos 8 caracteres.");
        hayError = true;
      }
      if (passNueva !== passConf) {
        marcarError(inputPassC, errPassC, "Las contraseñas no coinciden.");
        hayError = true;
      }
    }

    if (hayError) return;

    const cuerpo = { nombre, apellido };
    if (cambiaPass) {
      cuerpo.passwordActual = passActual;
      cuerpo.passwordNueva  = passNueva;
    }

    try {
      const respuesta = await fetch(`${API_BASE}/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo)
      });

      if (respuesta.status === 401) {
        marcarError(inputPassActual, errPassActual, "La contraseña actual no es correcta.");
        return;
      }

      if (!respuesta.ok) {
        throw new Error("Respuesta inesperada del servidor: " + respuesta.status);
      }

      // el backend devuelve el usuario con el mismo formato que cambiar-modo (incluye el rol)
      const actualizado = await respuesta.json();
      iniciarSesion(actualizado);

      inputPassActual.value = "";
      inputPass.value = "";
      inputPassC.value = "";

      mostrarModal("¡Datos actualizados con éxito!", "exito");
    } catch (error) {
      console.error("Error al guardar el perfil:", error);
      mostrarModal("No se pudieron guardar los cambios. Verificá que el servidor esté en funcionamiento e intentá de nuevo.", "error");
    }
  });
}