// reservas.js

const API_RESERVAS_URL = `${API_BASE}/reservas`;

const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");
let listaReservas = [];
let filtroActual  = "todas";
let usuarioActual = null;

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
  // si ya paso va al historial
  const pasada = r.fechaCheckOut < hoyISO();
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
    motivo:        r.motivoCancelacion,
    canceladaPor:  r.canceladaPor,
    fechaCheckIn:  r.fechaCheckIn,
    fechaCheckOut: r.fechaCheckOut,
    estado:        cancelada ? "cancelado" : "confirmado",
    estadoTexto:   cancelada ? "Cancelada" : (pasada ? "Finalizada" : "Confirmada"),
    pasada,
    // se puede cambiar o cancelar hasta el dia antes
    puedeCancelar: !cancelada && r.fechaCheckIn > hoyISO()
  };
}

// tarjeta
function crearTarjetaReserva(reserva) {
  const imgHtml = reserva.imagen
    ? `<img src="${reserva.imagen}" alt="${reserva.titulo}" class="reserva-img">`
    : `<div class="reserva-img reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  const botonesModificar = reserva.puedeCancelar
    ? `<button class="btn-secundario btn-accion btn-abrir-panel" data-panel="fechas" data-id="${reserva.id}"><i class="bi bi-calendar-range"></i> Cambiar fechas</button>
       <button class="btn-cancelar-reserva btn-accion btn-abrir-panel" data-panel="cancelar" data-id="${reserva.id}"><i class="bi bi-x-circle"></i> Cancelar</button>`
    : "";

  // las que no tienen canceladaPor son viejas, eran del anfitrion
  const textoMotivo = reserva.canceladaPor === "HUESPED"
    ? "Tu motivo de cancelación:"
    : "Cancelada por el anfitrión:";

  const paneles = reserva.puedeCancelar ? `
      <form class="panel-reserva form-cambiar-fechas" data-id="${reserva.id}" hidden>
        <h4><i class="bi bi-calendar-range"></i> Elegí las nuevas fechas</h4>
        <div class="panel-fechas">
          <label>Entrada <input type="text" class="nueva-entrada" placeholder="Entrada"></label>
          <label>Salida <input type="text" class="nueva-salida" placeholder="Salida"></label>
        </div>
        <p class="leyenda-ocupado"><span class="punto-ocupado"></span> En rojo: fechas ocupadas</p>
        <span class="campo-error"></span>
        <div class="acciones-panel">
          <button type="submit" class="btn-reserve btn-accion"><i class="bi bi-check2-circle"></i> Guardar fechas</button>
          <button type="button" class="btn-secundario btn-accion btn-cerrar-panel">Volver</button>
        </div>
      </form>
      <form class="panel-reserva form-cancelar" data-id="${reserva.id}" hidden>
        <h4><i class="bi bi-x-circle"></i> Cancelar reserva</h4>
        <label for="motivo-${reserva.id}">Contale al anfitrión por qué cancelás</label>
        <textarea id="motivo-${reserva.id}" rows="3" maxlength="500" placeholder="Ej: cambié mis planes de viaje"></textarea>
        <span class="campo-error"></span>
        <div class="acciones-panel">
          <button type="submit" class="btn-cancelar-reserva btn-accion"><i class="bi bi-x-circle"></i> Confirmar cancelación</button>
          <button type="button" class="btn-secundario btn-accion btn-cerrar-panel">Volver</button>
        </div>
      </form>` : "";

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
        ${reserva.motivo ? `<p class="motivo-cancelacion"><i class="bi bi-chat-left-text"></i> ${textoMotivo} <em>${escaparHtml(reserva.motivo)}</em></p>` : ""}
      </div>
      <div class="acciones">
        <a href="detalle.html?id=${reserva.alojamientoId}" class="btn-secundario btn-accion"><i class="bi bi-eye"></i> Ver detalle</a>
        ${botonesModificar}
      </div>
      ${paneles}
    </article>
  `;
}

// cancelar
function reemplazarReserva(datosApi) {
  const actualizada = adaptarReserva(datosApi);
  listaReservas = listaReservas.map((r) => (r.id === actualizada.id ? actualizada : r));
  renderizarReservas();
}

async function enviarAccion(form, url, metodo, cuerpo, mensajeExito) {
  const errSpan = form.querySelector(".campo-error");
  const boton   = form.querySelector("button[type='submit']");
  boton.disabled = true;
  try {
    const respuesta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo)
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      errSpan.textContent = datos.mensaje || "No se pudo completar la operación.";
      boton.disabled = false;
      return;
    }
    reemplazarReserva(datos);
    mostrarModal(mensajeExito, "exito");
  } catch (error) {
    console.error("Error en la reserva:", error);
    errSpan.textContent = "No se pudo conectar con el servidor. Intentá de nuevo.";
    boton.disabled = false;
  }
}

function cancelarReserva(form) {
  const motivo = form.querySelector("textarea").value.trim();
  if (!motivo) {
    form.querySelector(".campo-error").textContent = "Escribí el motivo de la cancelación.";
    return;
  }
  enviarAccion(form, `${API_RESERVAS_URL}/${form.dataset.id}/cancelar`, "POST",
    { usuarioId: usuarioActual.id, motivo }, "Reserva cancelada. El anfitrión va a ver tu motivo.");
}

// cambiar fechas
const MAX_NOCHES = 30;

function fechaISO(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return fechaISO(new Date(anio, mes - 1, dia + dias));
}

async function prepararCambioFechas(form, reserva) {
  const inputEntrada = form.querySelector(".nueva-entrada");
  const inputSalida  = form.querySelector(".nueva-salida");
  inputEntrada.value = reserva.fechaCheckIn;
  inputSalida.value  = reserva.fechaCheckOut;
  if (typeof flatpickr !== "function" || form.dataset.listo) return;
  form.dataset.listo = "1";

  // fechas ocupadas menos las de esta reserva
  let ocupadas = new Set();
  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/hospedaje/${reserva.alojamientoId}/ocupacion`);
    if (respuesta.ok) {
      (await respuesta.json()).forEach((o) => {
        for (let n = o.fechaCheckIn; n < o.fechaCheckOut; n = sumarDias(n, 1)) ocupadas.add(n);
      });
    }
  } catch (error) {
    console.error("No se pudo cargar la ocupación:", error);
  }
  for (let n = reserva.fechaCheckIn; n < reserva.fechaCheckOut; n = sumarDias(n, 1)) ocupadas.delete(n);

  const marcar = (_f, _t, _i, dia) => {
    if (ocupadas.has(fechaISO(dia.dateObj))) dia.classList.add("dia-ocupado");
  };
  const limiteSalida = (entrada) => {
    let limite = sumarDias(entrada, MAX_NOCHES);
    ocupadas.forEach((n) => { if (n > entrada && n < limite) limite = n; });
    return limite;
  };
  const comunes = { locale: "es", dateFormat: "Y-m-d", altInput: true, altFormat: "d/m/Y", disableMobile: true, onDayCreate: marcar };

  const salida = flatpickr(inputSalida, {
    ...comunes,
    minDate: sumarDias(reserva.fechaCheckIn, 1),
    maxDate: limiteSalida(reserva.fechaCheckIn)
  });
  flatpickr(inputEntrada, {
    ...comunes,
    minDate: sumarDias(hoyISO(), 1),
    disable: [(fecha) => ocupadas.has(fechaISO(fecha))],
    onChange: (_fechas, entrada) => {
      if (!entrada) return;
      salida.set("minDate", sumarDias(entrada, 1));
      salida.set("maxDate", limiteSalida(entrada));
      if (inputSalida.value <= entrada || inputSalida.value > limiteSalida(entrada)) salida.clear();
    }
  });
}

function cambiarFechas(form) {
  const entrada = form.querySelector(".nueva-entrada").value;
  const salida  = form.querySelector(".nueva-salida").value;
  const errSpan = form.querySelector(".campo-error");
  errSpan.textContent = "";
  if (!entrada || !salida) {
    errSpan.textContent = "Elegí la fecha de entrada y la de salida.";
    return;
  }
  if (salida <= entrada) {
    errSpan.textContent = "La salida tiene que ser posterior a la entrada.";
    return;
  }
  enviarAccion(form, `${API_RESERVAS_URL}/${form.dataset.id}/fechas`, "PUT",
    { usuarioId: usuarioActual.id, fechaCheckIn: entrada, fechaCheckOut: salida },
    "¡Fechas actualizadas! El importe se recalculó con las nuevas noches.");
}

// render
function renderizarReservas() {
  if (!contenedorReservas) return;
  let filtradas;
  if (filtroActual === "historial") {
    filtradas = listaReservas.filter((r) => r.pasada);
  } else {
    const vigentes = listaReservas.filter((r) => !r.pasada);
    filtradas = filtroActual === "todas" ? vigentes : vigentes.filter((r) => r.estado === filtroActual);
  }

  if (filtradas.length === 0) {
    contenedorReservas.innerHTML = `
      <div class="reservas-vacio">
        <i class="bi bi-calendar-x"></i>
        <p>${filtroActual === "historial" ? "Todavía no tenés reservas pasadas." : `No hay reservas ${filtroActual !== "todas" ? "en esta categoría" : "aún"}.`}</p>
        <a href="catalogo.html" class="btn-reserve">Buscar alojamientos</a>
      </div>`;
    return;
  }
  contenedorReservas.innerHTML = filtradas.map(crearTarjetaReserva).join("");
}

// botones de las tarjetas
contenedorReservas?.addEventListener("click", (e) => {
  const abrir = e.target.closest(".btn-abrir-panel");
  if (abrir) {
    const tarjeta = abrir.closest(".reserva");
    tarjeta.querySelectorAll(".panel-reserva").forEach((p) => { p.hidden = true; });
    const clase = abrir.dataset.panel === "fechas" ? ".form-cambiar-fechas" : ".form-cancelar";
    const form = tarjeta.querySelector(clase);
    form.hidden = false;
    if (abrir.dataset.panel === "fechas") {
      const reserva = listaReservas.find((r) => r.id === Number(abrir.dataset.id));
      prepararCambioFechas(form, reserva);
    } else {
      form.querySelector("textarea").focus();
    }
    return;
  }
  const cerrar = e.target.closest(".btn-cerrar-panel");
  if (cerrar) cerrar.closest(".panel-reserva").hidden = true;
});

contenedorReservas?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.matches(".form-cancelar")) cancelarReserva(e.target);
  if (e.target.matches(".form-cambiar-fechas")) cambiarFechas(e.target);
});

// tabs
tabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    tabs.forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");
    filtroActual = tab.dataset.filtro;
    renderizarReservas();
  });
});

// carga
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