// calendario.js
// bloqueo de fechas del anfitrion

const anfitrion         = requerirSesion("anfitrion");
const selectPropiedad   = document.getElementById("propiedad");
const formBloqueo       = document.getElementById("formBloqueo");
const textoSeleccion    = document.getElementById("textoSeleccion");
const inputMotivo       = document.getElementById("motivoBloqueo");
const errBloqueo        = document.getElementById("err-bloqueo");
const listaBloqueos     = document.getElementById("listaBloqueos");

// fecha -> "reserva" o "bloqueo"
let nochesOcupadas = new Map();
let calendario = null;

// utilidades
function fechaISO(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return fechaISO(new Date(anio, mes - 1, dia + dias));
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function propiedadActual() {
  return selectPropiedad.value;
}

// calendario
function pintarDia(_fechas, _texto, _instancia, diaElem) {
  const tipo = nochesOcupadas.get(fechaISO(diaElem.dateObj));
  if (tipo === "reserva") {
    diaElem.classList.add("dia-reservado");
    diaElem.title = "Reservado";
  } else if (tipo === "bloqueo") {
    diaElem.classList.add("dia-bloqueado");
    diaElem.title = "Bloqueado";
  }
}

function mostrarSeleccion(fechas) {
  if (fechas.length === 0) {
    textoSeleccion.textContent = "Todavía no elegiste días.";
  } else if (fechas.length === 1) {
    textoSeleccion.textContent = `Desde el ${formatearFecha(fechaISO(fechas[0]))}: tocá el último día (o el mismo para un solo día).`;
  } else {
    textoSeleccion.textContent = `Vas a bloquear del ${formatearFecha(fechaISO(fechas[0]))} al ${formatearFecha(fechaISO(fechas[1]))}.`;
  }
}

if (typeof flatpickr === "function") {
  calendario = flatpickr("#calendarioBloqueo", {
    inline: true,
    mode: "range",
    locale: "es",
    minDate: "today",
    showMonths: window.innerWidth > 700 ? 2 : 1,
    disable: [(fecha) => nochesOcupadas.has(fechaISO(fecha))],
    onDayCreate: pintarDia,
    onChange: mostrarSeleccion
  });
}

// datos de la propiedad elegida
async function cargarOcupacion(hospedajeId) {
  const respuesta = await fetch(`${API_BASE}/reservas/hospedaje/${hospedajeId}/ocupacion`);
  if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
  const ocupadas = await respuesta.json();

  nochesOcupadas = new Map();
  ocupadas.forEach((o) => {
    for (let noche = o.fechaCheckIn; noche < o.fechaCheckOut; noche = sumarDias(noche, 1)) {
      nochesOcupadas.set(noche, o.tipo);
    }
  });
  if (calendario) {
    calendario.clear();
    calendario.set("disable", [(fecha) => nochesOcupadas.has(fechaISO(fecha))]);
    calendario.redraw();
  }
}

function crearItemBloqueo(b) {
  const rango = b.fechaDesde === b.fechaHasta
    ? formatearFecha(b.fechaDesde)
    : `${formatearFecha(b.fechaDesde)} al ${formatearFecha(b.fechaHasta)}`;
  return `
    <div class="item-bloqueo">
      <div>
        <strong><i class="bi bi-lock-fill"></i> ${rango}</strong>
        ${b.motivo ? `<p>${escaparHtml(b.motivo)}</p>` : ""}
      </div>
      <button type="button" class="btn-secundario btn-liberar" data-id="${b.id}"><i class="bi bi-unlock-fill"></i> Liberar</button>
    </div>`;
}

async function cargarBloqueos(hospedajeId) {
  const respuesta = await fetch(`${API_BASE}/hospedajes/${hospedajeId}/bloqueos`);
  if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
  const bloqueos = await respuesta.json();
  listaBloqueos.innerHTML = bloqueos.length === 0
    ? `<p class="texto-ayuda">No hay fechas bloqueadas en este alojamiento.</p>`
    : bloqueos.map(crearItemBloqueo).join("");
}

async function cargarPropiedad() {
  const id = propiedadActual();
  errBloqueo.textContent = "";
  mostrarSeleccion([]);
  if (!id) return;
  try {
    await Promise.all([cargarOcupacion(id), cargarBloqueos(id)]);
  } catch (error) {
    console.error("Error al cargar la disponibilidad:", error);
    listaBloqueos.innerHTML = `<p class="mensaje-error">No se pudo cargar la disponibilidad. Verificá que el backend esté corriendo.</p>`;
  }
}

// bloquear
formBloqueo?.addEventListener("submit", async (e) => {
  e.preventDefault();
  errBloqueo.textContent = "";

  const id = propiedadActual();
  const fechas = calendario ? calendario.selectedDates : [];
  if (!id) {
    errBloqueo.textContent = "Elegí una propiedad.";
    return;
  }
  if (fechas.length === 0) {
    errBloqueo.textContent = "Elegí en el calendario los días a bloquear.";
    return;
  }
  // si eligio un solo dia, desde y hasta son el mismo
  const fechaDesde = fechaISO(fechas[0]);
  const fechaHasta = fechaISO(fechas[1] || fechas[0]);

  const boton = formBloqueo.querySelector("button[type='submit']");
  boton.disabled = true;
  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/${id}/bloqueos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anfitrionId: anfitrion.id, fechaDesde, fechaHasta, motivo: inputMotivo.value.trim() })
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      errBloqueo.textContent = datos.mensaje || "No se pudieron bloquear esas fechas.";
      return;
    }
    inputMotivo.value = "";
    await cargarPropiedad();
    mostrarModal("Fechas bloqueadas. Ya no se pueden reservar.", "exito");
  } catch (error) {
    console.error("Error al bloquear:", error);
    errBloqueo.textContent = "No se pudo conectar con el servidor.";
  } finally {
    boton.disabled = false;
  }
});

// liberar
listaBloqueos?.addEventListener("click", async (e) => {
  const boton = e.target.closest(".btn-liberar");
  if (!boton) return;
  boton.disabled = true;
  try {
    const respuesta = await fetch(`${API_BASE}/bloqueos/${boton.dataset.id}?anfitrionId=${anfitrion.id}`, {
      method: "DELETE"
    });
    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      mostrarModal(datos.mensaje || "No se pudo liberar.", "error");
      boton.disabled = false;
      return;
    }
    await cargarPropiedad();
    mostrarModal("Fechas liberadas. Ya se pueden reservar de nuevo.", "exito");
  } catch (error) {
    console.error("Error al liberar:", error);
    mostrarModal("No se pudo conectar con el servidor.", "error");
    boton.disabled = false;
  }
});

// propiedades del anfitrión
async function cargarPropiedades() {
  if (!anfitrion || !selectPropiedad) return;
  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/anfitrion/${anfitrion.id}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const propiedades = await respuesta.json();

    if (propiedades.length === 0) {
      selectPropiedad.innerHTML = `<option value="">Todavía no publicaste alojamientos</option>`;
      listaBloqueos.innerHTML = `<p class="texto-ayuda">Publicá un alojamiento para poder bloquear fechas.</p>`;
      return;
    }

    selectPropiedad.replaceChildren(...propiedades.map((h) => {
      const opcion = document.createElement("option");
      opcion.value = h.id;
      opcion.textContent = h.activo ? h.nombre : `${h.nombre} (pausada)`;
      return opcion;
    }));

    // si viene de mis propiedades ya trae el id
    const idPedido = new URLSearchParams(window.location.search).get("id");
    if (idPedido && propiedades.some((h) => String(h.id) === idPedido)) {
      selectPropiedad.value = idPedido;
    }
    cargarPropiedad();
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
    selectPropiedad.innerHTML = `<option value="">No se pudieron cargar</option>`;
  }
}

selectPropiedad?.addEventListener("change", cargarPropiedad);
cargarPropiedades();
