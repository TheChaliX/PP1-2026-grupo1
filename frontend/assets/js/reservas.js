// reservas.js — Frontend Mockup PP1 2026

const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");

let listaReservas = [];
let listaAlojamientos = [];

let filtroActual = "todas";


// ======================================================
// CREAR TARJETA DE RESERVA
// ======================================================

function crearTarjetaReserva(reserva) {

  // Buscar el alojamiento correspondiente en el catálogo
  const alojamiento = listaAlojamientos.find(
    alojamiento => alojamiento.id === reserva.alojamientoId
  );

  // Si por algún motivo no existe el alojamiento
  if (!alojamiento) {
    console.warn(
      `No se encontró el alojamiento: ${reserva.alojamientoId}`
    );
    return "";
  }


  // -----------------------------
  // Botones de acción
  // -----------------------------

  const accionesHtml = reserva.estado !== "cancelado"

    ? `
      <a 
        href="detalle.html?id=${reserva.alojamientoId}" 
        class="btn-secundario"
      >
        <i class="bi bi-eye"></i>
        Ver detalle
      </a>

      <button 
        class="btn-cancelar-reserva" 
        data-id="${reserva.id}"
      >
        <i class="bi bi-x-circle"></i>
        Cancelar
      </button>
    `

    : `
      <a 
        href="detalle.html?id=${reserva.alojamientoId}" 
        class="btn-secundario"
      >
        <i class="bi bi-eye"></i>
        Ver detalle
      </a>
    `;


  // -----------------------------
  // Imagen del alojamiento
  // -----------------------------

  const imgHtml = alojamiento.imagen

    ? `
      <img 
        src="${alojamiento.imagen}" 
        alt="${alojamiento.titulo}" 
        class="reserva-img"
      >
    `

    : `
      <div class="reserva-img reserva-sin-imagen">
        <i class="bi bi-image"></i>
      </div>
    `;


  // -----------------------------
  // Tarjeta completa
  // -----------------------------

  return `
    <article 
      class="reserva ${reserva.estado}" 
      data-id="${reserva.id}"
    >

      ${imgHtml}

      <div class="reserva-info">

        <h3>
          ${alojamiento.titulo}
        </h3>

        <p>
          <i class="bi bi-calendar-event"></i>
          ${reserva.fechas}
        </p>

        <p>
          <i class="bi bi-people"></i>
          ${reserva.huespedes} huésped(es)
        </p>

        <span class="badge-estado ${reserva.estado}">
          ${reserva.estadoTexto || "Reserva"}
        </span>

      </div>

      <div class="acciones">
        ${accionesHtml}
      </div>

    </article>
  `;
}


// ======================================================
// MOSTRAR RESERVAS
// ======================================================

function renderizarReservas() {

  if (!contenedorReservas) return;


  const filtradas =
    filtroActual === "todas"
      ? listaReservas
      : listaReservas.filter(
          reserva => reserva.estado === filtroActual
        );


  // Si no hay reservas
  if (filtradas.length === 0) {

    contenedorReservas.innerHTML = `
      <div class="reservas-vacio">

        <i class="bi bi-calendar-x"></i>

        <p>
          No hay reservas ${
            filtroActual !== "todas"
              ? "en esta categoría"
              : "aún"
          }.
        </p>

        <a 
          href="catalogo.html" 
          class="btn-reserve"
        >
          Buscar alojamientos
        </a>

      </div>
    `;

    return;
  }


  // Crear tarjetas
  contenedorReservas.innerHTML = filtradas
    .map(crearTarjetaReserva)
    .join("");


  // ====================================================
  // BOTONES CANCELAR
  // ====================================================

  document
    .querySelectorAll(".btn-cancelar-reserva")
    .forEach(btn => {

      btn.addEventListener("click", () => {

        if (
          confirm(
            "¿Seguro que querés cancelar esta reserva?"
          )
        ) {

          const id = btn.dataset.id;

          const reserva = listaReservas.find(
            r => r.id === id
          );


          if (reserva) {

            reserva.estado = "cancelado";
            reserva.estadoTexto = "Cancelado";

          }


          renderizarReservas();
        }

      });

    });

}


// ======================================================
// FILTROS
// ======================================================

tabs.forEach(tab => {

  tab.addEventListener("click", e => {

    e.preventDefault();


    tabs.forEach(t =>
      t.classList.remove("activo")
    );


    tab.classList.add("activo");


    filtroActual =
      tab.dataset.filtro;


    renderizarReservas();

  });

});


// ======================================================
// CARGAR DATOS
// ======================================================

async function cargarReservas() {

  if (!contenedorReservas) return;


  // -----------------------------
  // Usuario activo
  // -----------------------------

  const usuario = obtenerUsuarioActivo();


  if (
    !usuario ||
    usuario.rol === "anfitrion"
  ) {

    window.location.href =
      "login.html";

    return;
  }


  // -----------------------------
  // Bienvenida
  // -----------------------------

  const elBienvenida =
    document.querySelector(
      "#bienvenida-usuario"
    );


  if (elBienvenida) {

    elBienvenida.textContent =
      usuario.nombre ||
      usuario.email;

  }


  // -----------------------------
  // Mensaje de carga
  // -----------------------------

  contenedorReservas.innerHTML = `
    <p class="mensaje-cargando">
      <i class="bi bi-arrow-repeat spin"></i>
      Cargando reservas...
    </p>
  `;


  try {

    // Cargar ambos JSON al mismo tiempo
    const [
      respuestaReservas,
      respuestaCatalogo
    ] = await Promise.all([

      fetch("data/reservas.json"),

      fetch("data/catalogo.json")

    ]);


    if (
      !respuestaReservas.ok ||
      !respuestaCatalogo.ok
    ) {

      throw new Error(
        "No se pudieron cargar los archivos JSON"
      );

    }


    // Convertir respuestas a JSON
    listaReservas =
      await respuestaReservas.json();

    listaAlojamientos =
      await respuestaCatalogo.json();


    console.log(
      "Reservas cargadas:",
      listaReservas
    );

    console.log(
      "Alojamientos cargados:",
      listaAlojamientos
    );


    // Mostrar reservas
    renderizarReservas();


  } catch (err) {

    console.error(
      "Error al cargar reservas:",
      err
    );


    contenedorReservas.innerHTML = `
      <div class="reservas-vacio">

        <i class="bi bi-exclamation-triangle"></i>

        <p>
          Error al cargar las reservas.
        </p>

      </div>
    `;

  }

}


// ======================================================
// INICIAR
// ======================================================

cargarReservas();