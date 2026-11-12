/**
 * sesion.js - manejo de la sesion
 * PP1 2026 - Grupo 1
 *
 * El login lo valida el backend, aca solo guardamos el usuario
 * en sessionStorage para saber el rol.
 */

// url del backend
const API_BASE = "http://localhost:8080/api";

// iconos de los servicios
const iconosServicios = {
  "Wi-Fi":               "bi-wifi",
  "Cocina":              "bi-cup-hot",
  "Pileta":              "bi-water",
  "Estacionamiento":     "bi-p-circle",
  "Desayuno":            "bi-cup-hot-fill",
  "Parrilla":            "bi-fire",
  "Vista panorámica":    "bi-binoculars",
  "Aire acondicionado":  "bi-snow2",
  "TV":                  "bi-tv",
  "Calefacción":         "bi-thermometer-sun",
  "Lavandería":          "bi-bag-heart",
  "Jacuzzi":             "bi-droplet-half",
  "Mascotas permitidas": "bi-heart",
  "Apto para niños":     "bi-emoji-smile",
  "Seguridad 24h":       "bi-shield-check",
  "Gym":                 "bi-bicycle"
};

function iconoServicio(nombre) {
  return iconosServicios[nombre] || "bi-check-circle";
}

// sesión activa
function iniciarSesion(datos, email) {
  // se puede llamar con el usuario de la api o con (rol, email)
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

  // dura mientras la pestaña este abierta
  sessionStorage.setItem("usuarioActivo", JSON.stringify(usuario));
}

function obtenerUsuarioActivo() {
  return JSON.parse(sessionStorage.getItem("usuarioActivo")) || null;
}

function cerrarSesion() {
  sessionStorage.removeItem("usuarioActivo");
  window.location.href = "login.html";
}

// protección de rutas
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

// cambio de modo
async function cambiarModo() {
  const usuario = obtenerUsuarioActivo();

  if (!usuario || !usuario.id) {
    mostrarModal("Volvé a iniciar sesión para cambiar de modo.", "error");
    return;
  }

  const nuevoRol = usuario.rol === "anfitrion" ? "huesped" : "anfitrion";

  try {
    const respuesta = await fetch(`${API_BASE}/usuarios/${usuario.id}/cambiar-modo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rol: nuevoRol })
    });

    if (!respuesta.ok) {
      throw new Error("Respuesta inesperada del servidor: " + respuesta.status);
    }

    const actualizado = await respuesta.json();
    iniciarSesion(actualizado);

    window.location.href = actualizado.rol === "anfitrion"
      ? "mis-propiedades.html"
      : "catalogo.html";
  } catch (error) {
    console.error("Error al cambiar de modo:", error);
    mostrarModal("No se pudo cambiar de modo. Verificá que el servidor esté en funcionamiento e intentá de nuevo.", "error");
  }
}