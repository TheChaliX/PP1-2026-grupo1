// reservas.js — Frontend Mockup PP1 2026
const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");
let listaReservas = [];
let filtroActual  = "todas";

// ── Tarjeta ────────────────────────────────────────────────────────────────
function crearTarjetaReserva(reserva) {
  const puedeOperar = reserva.estado !== "cancelado";

  const imgHtml = reserva.imagen
    ? `<img src="${reserva.imagen}" alt="${reserva.titulo}" class="reserva-img">`
    : `<div class="reserva-img reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  const accionesHtml = puedeOperar
    ? `<a href="detalle.html?id=${reserva.alojamientoId}" class="btn-secundario btn-accion"><i class="bi bi-eye"></i> Ver detalle</a>
       <button class="btn-cancelar-reserva btn-accion" data-id="${reserva.id}"><i class="bi bi-x-circle"></i> Cancelar</button>`
    : `<a href="detalle.html?id=${reserva.alojamientoId}" class="btn-secundario btn-accion"><i class="bi bi-eye"></i> Ver detalle</a>`;

  return `
    <article class="reserva ${reserva.estado}">
      ${imgHtml}
      <div class="reserva-info">
        <h3>${reserva.titulo || "Alojamiento"}</h3>
        <p><i class="bi bi-calendar-event"></i> ${reserva.fechas}</p>
        <p><i class="bi bi-people"></i> ${reserva.huespedes} huésped${reserva.huespedes !== 1 ? "es" : ""}</p>
        <span class="badge-estado ${reserva.estado}">${reserva.estadoTexto}</span>
      </div>
      <div class="acciones">
        ${accionesHtml}
      </div>
    </article>
  `;
}

// ── Render ─────────────────────────────────────────────────────────────────
function renderizarReservas() {
  if (!contenedorReservas) return;
  const filtradas = filtroActual === "todas"
    ? listaReservas
    : listaReservas.filter((r) => r.estado === filtroActual);

  if (filtradas.length === 0) {
    contenedorReservas.innerHTML = `
      <div class="reservas-vacio">
        <i class="bi bi-calendar-x"></i>
        <p>No hay reservas ${filtroActual !== "todas" ? "en esta categoría" : "aún"}.</p>
        <a href="catalogo.html" class="btn-reserve">Buscar alojamientos</a>
      </div>`;
    return;
  }
  contenedorReservas.innerHTML = filtradas.map(crearTarjetaReserva).join("");

  document.querySelectorAll(".btn-cancelar-reserva").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (confirm("¿Seguro que querés cancelar esta reserva?")) {
        const id = btn.dataset.id;
        const res = listaReservas.find((r) => r.id === id);
        if (res) { res.estado = "cancelado"; res.estadoTexto = "Cancelada"; }
        renderizarReservas();
      }
    });
  });
}

// ── Tabs ───────────────────────────────────────────────────────────────────
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    tabs.forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");
    filtroActual = tab.dataset.filtro;
    renderizarReservas();
  });
});

// ── Carga ──────────────────────────────────────────────────────────────────
async function cargarReservas() {
  if (!contenedorReservas) return;
  const usuario = obtenerUsuarioActivo();
  if (!usuario) { window.location.href = "login.html"; return; }
  if (usuario.rol === "anfitrion") { window.location.href = "mis-propiedades.html"; return; }

  const elBienvenida = document.querySelector("#bienvenida-usuario");
  if (elBienvenida) elBienvenida.textContent = usuario.nombre || usuario.email;

  contenedorReservas.innerHTML = `<p class="mensaje-cargando"><i class="bi bi-arrow-repeat spin"></i> Cargando reservas...</p>`;

  try {
    const [respR, respC] = await Promise.all([
      fetch("data/reservas.json"),
      fetch("data/catalogo.json")
    ]);
    if (!respR.ok) throw new Error("Sin datos");
    const reservas  = await respR.json();
    const catalogo  = respC.ok ? await respC.json() : [];

    // Enriquecer cada reserva con titulo e imagen del catalogo si no los tiene
    listaReservas = reservas.map((r) => {
      const aloj = catalogo.find((a) => a.id === r.alojamientoId);
      return {
        ...r,
        titulo: r.titulo || (aloj ? aloj.titulo : "Alojamiento"),
        imagen: r.imagen || (aloj ? aloj.imagen : "")
      };
    });
    renderizarReservas();
  } catch {
    contenedorReservas.innerHTML = `<p class="mensaje-error"><i class="bi bi-exclamation-triangle"></i> Error al cargar las reservas.</p>`;
  }
}

cargarReservas();
