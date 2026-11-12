// reservas-recibidas.js
// reservas que le hicieron al anfitrion

const API_RESERVAS_URL = `${API_BASE}/reservas`;

const anfitrion        = requerirSesion("anfitrion");
const contenedor       = document.getElementById("contenedor-reservas-recibidas");
const selectPropiedad  = document.getElementById("filtro-propiedad");
const selectEstado     = document.getElementById("filtro-estado");
const inputTexto       = document.getElementById("filtro-texto");

let reservasRecibidas = [];

// utilidades
function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// para que no se pueda meter html en el motivo
function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

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
    estadoTexto: cancelada ? "Cancelada" : "Confirmada",
    motivo:      r.motivoCancelacion,
    canceladaPor: r.canceladaPor,
    // se puede cancelar hasta el dia antes
    puedeCancelar: !cancelada && r.fechaCheckIn > hoyISO()
  };
}

// tarjeta
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
        ${r.motivo ? `<p class="reserva-solicitud"><i class="bi bi-chat-left-text"></i> <strong>${r.canceladaPor === "HUESPED" ? "Canceló el huésped:" : "Motivo de tu cancelación:"}</strong> <em>${escaparHtml(r.motivo)}</em></p>` : ""}
        <div class="acciones-recibida">
          <span class="badge-estado ${r.estado}">${r.estadoTexto}</span>
          ${r.puedeCancelar ? `<button class="btn-rechazar btn-accion btn-abrir-cancelacion" data-id="${r.id}"><i class="bi bi-x-circle"></i> Cancelar reserva</button>` : ""}
        </div>
        ${r.puedeCancelar ? `
        <form class="form-cancelacion" data-id="${r.id}" hidden>
          <label for="motivo-${r.id}">Motivo de la cancelación (lo va a ver el huésped)</label>
          <textarea id="motivo-${r.id}" rows="3" maxlength="500" placeholder="Ej: el alojamiento está en reparación esas fechas"></textarea>
          <span class="campo-error"></span>
          <div class="acciones-recibida">
            <button type="submit" class="btn-rechazar btn-accion"><i class="bi bi-x-circle"></i> Confirmar cancelación</button>
            <button type="button" class="btn-secundario btn-accion btn-volver">Volver</button>
          </div>
        </form>` : ""}
      </div>
    </article>`;
}

// render y filtros
function renderizar(lista) {
  if (!contenedor) return;
  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="reservas-vacio"><i class="bi bi-inbox"></i><p>No hay reservas para mostrar.</p></div>`;
    return;
  }
  contenedor.innerHTML = lista.map(crearTarjetaRecibida).join("");
}

// cancelar una reserva
async function cancelarReserva(id, motivo, form) {
  const errSpan = form.querySelector(".campo-error");
  const boton   = form.querySelector("button[type='submit']");
  boton.disabled = true;

  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/${id}/cancelar-anfitrion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anfitrionId: anfitrion.id, motivo })
    });
    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      errSpan.textContent = datos.mensaje || "No se pudo cancelar la reserva.";
      boton.disabled = false;
      return;
    }

    const actualizada = adaptarReserva(datos);
    reservasRecibidas = reservasRecibidas.map((r) => (r.id === actualizada.id ? actualizada : r));
    aplicarFiltros();
    mostrarModal("Reserva cancelada. El huésped va a ver el motivo en Mis reservas.", "exito");
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    errSpan.textContent = "No se pudo conectar con el servidor. Intentá de nuevo.";
    boton.disabled = false;
  }
}

// botones de las tarjetas
contenedor?.addEventListener("click", (e) => {
  const abrir = e.target.closest(".btn-abrir-cancelacion");
  if (abrir) {
    const form = contenedor.querySelector(`.form-cancelacion[data-id="${abrir.dataset.id}"]`);
    form.hidden = false;
    abrir.hidden = true;
    form.querySelector("textarea").focus();
    return;
  }
  const volver = e.target.closest(".btn-volver");
  if (volver) {
    const form = volver.closest(".form-cancelacion");
    form.hidden = true;
    contenedor.querySelector(`.btn-abrir-cancelacion[data-id="${form.dataset.id}"]`).hidden = false;
  }
});

contenedor?.addEventListener("submit", (e) => {
  const form = e.target.closest(".form-cancelacion");
  if (!form) return;
  e.preventDefault();

  const motivo = form.querySelector("textarea").value.trim();
  if (!motivo) {
    form.querySelector(".campo-error").textContent = "Escribí el motivo para que el huésped sepa por qué se cancela.";
    return;
  }
  cancelarReserva(Number(form.dataset.id), motivo, form);
});

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

// arma el select con las propiedades que tienen reservas
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

// carga
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
