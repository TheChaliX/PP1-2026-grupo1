// reservas-recibidas.js — PP1 2026 Grupo 1
// M5: el anfitrión ve las reservas de todos sus alojamientos (salen de MySQL).

const API_RESERVAS_URL = `${API_BASE}/reservas`;

const anfitrion        = requerirSesion("anfitrion");
const contenedor       = document.getElementById("contenedor-reservas-recibidas");
const selectPropiedad  = document.getElementById("filtro-propiedad");
const selectEstado     = document.getElementById("filtro-estado");
const inputTexto       = document.getElementById("filtro-texto");

let reservasRecibidas = [];

// ── Utilidades ─────────────────────────────────────────────────────────────
function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// Traduce la reserva de la API al formato de la tarjeta
function adaptarReserva(r) {
  const cancelada = r.estado === "CANCELADA";
  return {
    id:          r.id,
    propiedadId: String(r.hospedajeId),
    propiedad:   r.hospedaje,
    imagen:      r.imagen,
    huesped:     r.huesped,
    fechas:      `${formatearFecha(r.fechaCheckIn)} al ${formatearFecha(r.fechaCheckOut)}`,
    noches:      r.noches,
    huespedes:   r.huespedes,
    importe:     r.importeTotal,
    estado:      cancelada ? "cancelado" : "confirmado",
    estadoTexto: cancelada ? "Cancelada" : "Confirmada"
  };
}

// ── Tarjeta ────────────────────────────────────────────────────────────────
function crearTarjetaRecibida(r) {
  const imgHtml = r.imagen
    ? `<img src="${r.imagen}" alt="${r.propiedad}" class="reserva-recibida-img">`
    : `<div class="reserva-recibida-img reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  return `
    <article class="reserva-recibida" data-id="${r.id}">
      ${imgHtml}
      <div class="info-reserva">
        <h3><i class="bi bi-geo-alt-fill"></i> ${r.propiedad}</h3>
        <p><strong><i class="bi bi-person"></i> Huésped:</strong> ${r.huesped}</p>
        <p><strong><i class="bi bi-calendar"></i> Fechas:</strong> ${r.fechas} (${r.noches} noche${r.noches !== 1 ? "s" : ""})</p>
        <p><strong><i class="bi bi-people"></i> Cantidad:</strong> ${r.huespedes} huésped${r.huespedes !== 1 ? "es" : ""}</p>
        <p><strong><i class="bi bi-cash-coin"></i> Total:</strong> $${Number(r.importe).toLocaleString("es-AR")}</p>
        <div class="acciones-recibida"><span class="badge-estado ${r.estado}">${r.estadoTexto}</span></div>
      </div>
    </article>`;
}

// ── Render y filtros ───────────────────────────────────────────────────────
function renderizar(lista) {
  if (!contenedor) return;
  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="reservas-vacio"><i class="bi bi-inbox"></i><p>No hay reservas para mostrar.</p></div>`;
    return;
  }
  contenedor.innerHTML = lista.map(crearTarjetaRecibida).join("");
}

function aplicarFiltros() {
  const prop   = selectPropiedad?.value || "todas";
  const estado = selectEstado?.value    || "todos";
  const texto  = inputTexto?.value.toLowerCase().trim() || "";

  const filtradas = reservasRecibidas.filter((r) => {
    const okProp   = prop   === "todas" || r.propiedadId === prop;
    const okEstado = estado === "todos" || r.estado      === estado;
    const okTexto  = !texto || r.huesped.toLowerCase().includes(texto);
    return okProp && okEstado && okTexto;
  });

  renderizar(filtradas);
}

// Las opciones del filtro salen de las propias reservas (sin repetir)
function cargarOpcionesPropiedad() {
  if (!selectPropiedad) return;
  const propiedades = new Map(reservasRecibidas.map((r) => [r.propiedadId, r.propiedad]));
  propiedades.forEach((nombre, id) => {
    const opcion = document.createElement("option");
    opcion.value = id;
    opcion.textContent = nombre;
    selectPropiedad.appendChild(opcion);
  });
}

[selectPropiedad, selectEstado].forEach((el) => el?.addEventListener("change", aplicarFiltros));
inputTexto?.addEventListener("input", aplicarFiltros);

// ── Carga ──────────────────────────────────────────────────────────────────
async function cargarReservasRecibidas() {
  if (!anfitrion || !contenedor) return;

  contenedor.innerHTML = `<p class="mensaje-cargando"><i class="bi bi-arrow-repeat spin"></i> Cargando reservas...</p>`;

  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/anfitrion/${anfitrion.id}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const datos = await respuesta.json();

    reservasRecibidas = datos.map(adaptarReserva);
    cargarOpcionesPropiedad();
    renderizar(reservasRecibidas);
  } catch (error) {
    console.error("Error al cargar las reservas recibidas:", error);
    contenedor.innerHTML = `<p class="mensaje-error"><i class="bi bi-exclamation-triangle"></i> No se pudieron cargar las reservas. Verificá que el backend esté corriendo.</p>`;
  }
}

cargarReservasRecibidas();
