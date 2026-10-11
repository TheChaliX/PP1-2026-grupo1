/**
 * sesion.js — Gestión de Sesión (Front-end)
 * PP1 2026 — Grupo 1
 *
 * La validación del usuario la hace el backend (POST /api/auth/login).
 * Acá solo se guardan los datos del usuario que devolvió el servidor en
 * sessionStorage, para poder navegar entre pantallas según el rol.
 */

// ── Sesión activa ─────────────────────────────────────────────────────────────

function iniciarSesion(datos, email) {
  // Uso nuevo: iniciarSesion(usuarioDeLaApi)
  // Uso viejo (por compatibilidad): iniciarSesion(rol, email)
  const usuario = (typeof datos === "object" && datos !== null)
    ? {
        id:       datos.id,
        username: datos.username,
        nombre:   datos.nombre,
        apellido: datos.apellido,
        email:    datos.email,
        rol:      datos.rol
      }
    : { nombre: "Usuario", email: email, rol: datos };

  // Se guarda solo mientras la pestaña esté abierta
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));
}

function obtenerUsuarioActivo() {
  return JSON.parse(sessionStorage.getItem("usuarioActivo")) || null;
}

function cerrarSesion() {
  sessionStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
}

// ── Protección de rutas ───────────────────────────────────────────────────────

function requerirSesion(rolRequerido) {
  const usuario = obtenerUsuarioActivo();

  if (!usuario) {
    window.location.href = "login.html";
    return null;
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    if (usuario.rol === "anfitrion") {
      window.location.href = "mis-propiedades.html";
    } else {
      window.location.href = "catalogo.html";
    }
    return null;
  }

  return usuario;
}