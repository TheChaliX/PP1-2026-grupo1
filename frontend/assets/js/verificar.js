// verificar.js
// confirma el correo con el token que viene en el link: verificar.html?token=...

const API_AUTH_URL = `${API_BASE}/auth`;

const tituloVerificar = document.getElementById("verificarTitulo");
const textoVerificar  = document.getElementById("verificarTexto");
const iconoVerificar  = document.getElementById("verificarIcono");
const botonVerificar  = document.getElementById("verificarBoton");

function mostrarResultado(ok, titulo, texto) {
  tituloVerificar.textContent = titulo;
  textoVerificar.textContent = texto;
  iconoVerificar.className = ok ? "bi bi-check-circle-fill" : "bi bi-exclamation-circle-fill";
  botonVerificar.style.display = "block";
}

async function verificarCuenta() {
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) {
    mostrarResultado(false, "Link incompleto", "Abrí el link tal cual llegó en el correo de confirmación.");
    return;
  }

  try {
    const respuesta = await fetch(`${API_AUTH_URL}/verificar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const datos = await respuesta.json().catch(() => ({}));

    if (respuesta.ok) {
      mostrarResultado(true, "¡Cuenta confirmada!", "Ya podés iniciar sesión con tu email y contraseña.");
    } else {
      mostrarResultado(false, "No pudimos confirmar tu cuenta",
        (datos.mensaje || "El link no es válido.") + ". Si ya la confirmaste, probá iniciar sesión; si no, pedí un correo nuevo desde el login.");
    }
  } catch (error) {
    console.error("Error al confirmar la cuenta:", error);
    mostrarResultado(false, "Sin conexión con el servidor", "Verificá que el servidor esté en funcionamiento e intentá de nuevo.");
  }
}

verificarCuenta();
