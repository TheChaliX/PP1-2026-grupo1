// reservas.js — PP1 2026 Grupo 1

const API_RESERVAS_URL = "http://localhost:8080/api/reservas";

const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");
let listaReservas = [];
let filtroActual  = "todas";
let usuarioActual = null;

// ── Utilidades ─────────────────────────────────────────────────────────────
function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Traduce la reserva que devuelve la API al formato que usan las tarjetas
function adaptarReserva(r) {
  const cancelada = r.estado === "CANCELADA";
  return {
    id:            r.id,
    alojamientoId: r.hospedajeId,
    titulo:        r.hospedaje,
    ciudad:        r.ciudad,
    imagen:        r.imagen,
    fechas:        `${formatearFecha(r.fechaCheckIn)} → ${formatearFecha(r.fechaCheckOut)}`,
    noches:        r.noches,
    huespedes:     r.huespedes,
    importe:       r.importeTotal,
    estado:        cancelada ? "cancelado" : "confirmado",
    estadoTexto:   cancelada ? "Cancelada" : "Confirmada",
    // Solo se puede cancelar hasta el día anterior a la entrada
    puedeCancelar: !cancelada && r.fechaCheckIn > hoyISO()
  };
}

// ── Tarjeta ────────────────────────────────────────────────────────────────
function crearTarjetaReserva(reserva) {
  const imgHtml = reserva.imagen
    ? `<img src="${reserva.imagen}" alt="${reserva.titulo}" class="reserva-img">`
    : `<div class="reserva-img reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  const botonCancelar = reserva.puedeCancelar
    ? `<button class="btn-cancelar-reserva btn-accion" data-id="${reserva.id}"><i class="bi bi-x-circle"></i> Cancelar</button>`
    : "";

  return `
    <article class="reserva ${reserva.estado}">
      ${imgHtml}
      <div class="reserva-info">
        <h3>${reserva.titulo}</h3>
        <p><i class="bi bi-geo-alt"></i> ${reserva.ciudad}</p>
        <p><i class="bi bi-calendar-event"></i> ${reserva.fechas} (${reserva.noches} noche${reserva.noches !== 1 ? "s" : ""})</p>
        <p><i class="bi bi-people"></i> ${reserva.huespedes} huésped${reserva.huespedes !== 1 ? "es" : ""}</p>
        <p><i class="bi bi-cash-coin"></i> Total: $${Number(reserva.importe).toLocaleString("es-AR")}</p>
        <span class="badge-estado ${reserva.estado}">${reserva.estadoTexto}</span>
      </div>
      <div class="acciones">
        <a href="detalle.html?id=${reserva.alojamientoId}" class="btn-secundario btn-accion"><i class="bi bi-eye"></i> Ver detalle</a>
        ${botonCancelar}
      </div>
    </article>
  `;
}

// ── Cancelar ───────────────────────────────────────────────────────────────
async function cancelarReserva(id) {
  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/${id}/cancelar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuarioActual.id })
    });

    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      mostrarModal(datos.mensaje || "No se pudo cancelar la reserva.", "error");
      return;
    }

    const actualizada = adaptarReserva(await respuesta.json());
    listaReservas = listaReservas.map((r) => (r.id === actualizada.id ? actualizada : r));
    renderizarReservas();
    mostrarModal("Reserva cancelada.", "exito");
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
  }
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
        cancelarReserva(Number(btn.dataset.id));
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
  if (!usuario || !usuario.id) { window.location.href = "login.html"; return; }
  if (usuario.rol === "anfitrion") { window.location.href = "mis-propiedades.html"; return; }
  usuarioActual = usuario;

  const elBienvenida = document.querySelector("#bienvenida-usuario");
  if (elBienvenida) elBienvenida.textContent = usuario.nombre || usuario.email;

  contenedorReservas.innerHTML = `<p class="mensaje-cargando"><i class="bi bi-arrow-repeat spin"></i> Cargando reservas...</p>`;

  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/usuario/${usuario.id}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const reservas = await respuesta.json();
    listaReservas = reservas.map(adaptarReserva);
    renderizarReservas();
  } catch (error) {
    console.error("Error al cargar las reservas:", error);
    contenedorReservas.innerHTML = `<p class="mensaje-error"><i class="bi bi-exclamation-triangle"></i> Error al cargar las reservas.</p>`;
  }
}

cargarReservas();