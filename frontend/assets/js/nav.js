/**
 * nav.js — Navbar dinámica por rol
 */

(function () {
  // Limpiamos la basura vieja del localStorage por si quedó algo de versiones anteriores
  localStorage.removeItem("usuarioActivo");

  // Leemos del sessionStorage correcto a través de la función global
  const usuario = typeof obtenerUsuarioActivo === "function" ? obtenerUsuarioActivo() : null;

  const navContainer = document.getElementById("navbar-dinamica");
  if (!navContainer) return;

  const linksHuesped = `
    <a href="catalogo.html"><i class="bi bi-search"></i> Catálogo</a>
    <a href="reservas.html"><i class="bi bi-calendar-check"></i> Mis reservas</a>
    <a href="perfil.html"><i class="bi bi-person-circle"></i> Mi perfil</a>
  `;

  const linksAnfitrion = `
    <a href="catalogo.html"><i class="bi bi-search"></i> Catálogo</a>
    <a href="mis-propiedades.html"><i class="bi bi-house-door"></i> Mis propiedades</a>
    <a href="publicar-alojamiento.html"><i class="bi bi-plus-circle"></i> Publicar</a>
    <a href="reservas-recibidas.html"><i class="bi bi-inbox"></i> Reservas recibidas</a>
    <a href="calendario.html"><i class="bi bi-calendar3"></i> Calendario</a>
    <a href="perfil.html"><i class="bi bi-person-circle"></i> Mi perfil</a>
  `;

  if (!usuario) {
    navContainer.innerHTML = `
      <nav class="navbar">
        <a href="catalogo.html"><i class="bi bi-search"></i> Catálogo</a>
        <a href="login.html"><i class="bi bi-box-arrow-in-right"></i> Ingresar</a>
        <a href="registro.html"><i class="bi bi-person-plus"></i> Registrarse</a>
      </nav>
    `;
    return;
  }

  const linksRol = usuario.rol === "anfitrion" ? linksAnfitrion : linksHuesped;
  const etiquetaRol = usuario.rol === "anfitrion"
    ? `<span class="nav-badge-rol anfitrion"><i class="bi bi-house-fill"></i> Anfitrión</span>`
    : `<span class="nav-badge-rol huesped"><i class="bi bi-person-fill"></i> Huésped</span>`;

  navContainer.innerHTML = `
    <nav class="navbar">
      ${linksRol}
      ${etiquetaRol}
      <button class="btn-cerrar-sesion" onclick="cerrarSesion()">
        <i class="bi bi-box-arrow-right"></i> Salir
      </button>
    </nav>
  `;

  const urlActual = window.location.pathname.split("/").pop();
  navContainer.querySelectorAll("a[href]").forEach((link) => {
    if (link.getAttribute("href") === urlActual) {
      link.classList.add("nav-activo");
    }
  });
})();
