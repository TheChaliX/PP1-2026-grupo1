/**
 * sesion.js — Gestión de Sesión Simplificada (Front-end mockup)
 * PP1 2026 — Grupo 1
 * 
 * NOTA: Como la validación real la hará el Backend con Spring Boot,
 * esto solo guarda un estado de sesión temporal en memoria del navegador
 * (sessionStorage) para poder navegar entre pantallas según el rol.
 */

// ── Sesión activa ─────────────────────────────────────────────────────────────

function iniciarSesion(rol, email) {
  // Guardamos solo durante la pestaña abierta
  sessionStorage.setItem(
    "usuarioActivo",
    JSON.stringify({ nombre: "Usuario", email: email, rol: rol })
  );
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
