/**
 * nav.js - navbar segun el rol
 */

(function () {
  // limpiamos lo que haya quedado de versiones viejas
  localStorage.removeItem("usuarioActivo");

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
    <a href="reservas-recibidas.html"><i class="bi bi-inbox"></i> Reservas recibidas <span class="nav-contador" hidden></span></a>
    <a href="perfil.html"><i class="bi bi-person-circle"></i> Mi perfil</a>
  `;

  if (!usuario) {
    navContainer.innerHTML = `
      <nav class="navbar navbar-invitado">
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
      const textoCambioModo = usuario.rol === "anfitrion"
    ? "Modo huésped"
    : "Modo anfitrión";

    navContainer.innerHTML = `
    <nav class="navbar">
      ${linksRol}
      ${etiquetaRol}
      <button class="btn-cambiar-modo" onclick="cambiarModo()">
        <i class="bi bi-arrow-left-right"></i> ${textoCambioModo}
      </button>
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

  if (usuario.rol === "anfitrion") {
    actualizarContadorReservas(usuario.id, urlActual === "reservas-recibidas.html");
  }
})();

// Numero rojo en "Reservas recibidas": cuantas reservas confirmadas entraron desde la ultima
// vez que el anfitrion abrio esa pantalla. En el navegador se guarda el id de la ultima reserva
// que vio (los id de reserva siempre crecen). La primera vez no muestra nada.
async function actualizarContadorReservas(anfitrionId, estaEnReservasRecibidas) {
  const contador = document.querySelector(".nav-contador");
  const clave = `ultimaReservaVista_${anfitrionId}`;
  if (!contador) return;

  let reservas;
  try {
    const respuesta = await fetch(`${API_BASE}/reservas/anfitrion/${anfitrionId}`);
    if (!respuesta.ok) return;
    reservas = await respuesta.json();
  } catch {
    return;   // sin backend no se muestra el numero, el resto de la barra sigue igual
  }

  const ultimoId = reservas.reduce((max, r) => Math.max(max, r.id), 0);

  let vista = null;
  try { vista = localStorage.getItem(clave); } catch { /* sin almacenamiento: no hay numero */ }

  // al entrar a Reservas recibidas (o la primera vez) se marca todo como visto
  if (estaEnReservasRecibidas || vista === null) {
    try { localStorage.setItem(clave, String(ultimoId)); } catch { /* nada */ }
    return;
  }

  const nuevas = reservas.filter((r) => r.estado === "CONFIRMADA" && r.id > Number(vista)).length;
  if (nuevas > 0) {
    contador.textContent = nuevas > 9 ? "9+" : String(nuevas);
    contador.title = `${nuevas} reserva${nuevas === 1 ? "" : "s"} nueva${nuevas === 1 ? "" : "s"}`;
    contador.hidden = false;
    contador.closest("a")?.classList.add("tiene-nuevas");
  }
}
