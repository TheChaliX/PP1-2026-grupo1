const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");

let listaReservas = [];
let filtroActual = "todas";


const reservasRespaldo = [
  {
    id: "cordoba",
    titulo: "Casa en las montañas",
    imagen: "img/img-cordoba.jpg",
    fechas: "15/07/2026 al 20/07/2026",
    huespedes: 4,
    estado: "confirmado",
    estadoTexto: "Confirmado"
  },
  {
    id: "villacp",
    titulo: "Cabaña con pileta",
    imagen: "img/img-villacp.webp",
    fechas: "10/08/2026 al 15/08/2026",
    huespedes: 2,
    estado: "pendiente",
    estadoTexto: "Pendiente de confirmacion"
  },
  {
    id: "santafe",
    titulo: "Casa quinta con pileta",
    imagen: "img/img-santafe.jpg",
    fechas: "05/06/2026 al 08/06/2026",
    huespedes: 6,
    estado: "cancelado",
    estadoTexto: "Cancelado"
  }
];

function crearTarjetaReserva(reserva) {
  const accionesHtml = reserva.estado !== "cancelado" 
    ? `
      <a href="detalle.html?id=${reserva.id}">Ver detalle</a>
      <button class="btn-modificar">Modificar</button>
      <button class="btn-cancelar">Cancelar</button>
    ` 
    : `
      <a href="detalle.html?id=${reserva.id}">Ver detalle</a>
    `;

  return `
    <article class="reserva ${reserva.estado}" data-id="${reserva.id}">
      <img src="${reserva.imagen}" alt="${reserva.titulo}">

      <div class="reserva-info">
        <h3>${reserva.titulo}</h3>
        <p>${reserva.fechas} - ${reserva.huespedes} huéspedes</p>
        <span class="estado ${reserva.estado}">
          ${reserva.estadoTexto}
        </span>
      </div>

      <div class="acciones">
        ${accionesHtml}
      </div>
    </article>
  `;
}

function renderizarReservas() {
  if (!contenedorReservas) return;

  const reservasFiltradas = listaReservas.filter((reserva) => {
    return filtroActual === "todas" || reserva.estado === filtroActual;
  });

  let htmlAcumulado = "";
  reservasFiltradas.forEach((reserva) => {
    htmlAcumulado += crearTarjetaReserva(reserva);
  });

  contenedorReservas.innerHTML = htmlAcumulado;
  escucharEventosAcciones();
}

function modificarReserva(idReserva) {
  window.location.href = `detalle.html?id=${idReserva}`;
}

function cancelarReserva(idReserva) {
  const confirmar = confirm("¿Seguro que querés cancelar esta reserva?");

  if (confirmar) {
    const reserva = listaReservas.find((r) => r.id === idReserva);
    if (reserva) {
      reserva.estado = "cancelado";
      reserva.estadoTexto = "Cancelado";
    }
    renderizarReservas();
  }
}

function escucharEventosAcciones() {
  const botonesModificar = document.querySelectorAll(".acciones .btn-modificar");
  const botonesCancelar = document.querySelectorAll(".acciones .btn-cancelar");

  botonesModificar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest(".reserva");
      modificarReserva(tarjeta.dataset.id);
    });
  });

  botonesCancelar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest(".reserva");
      cancelarReserva(tarjeta.dataset.id);
    });
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", (evento) => {
    evento.preventDefault();

    tabs.forEach((t) => t.classList.remove("activo"));
    tab.classList.add("activo");

    filtroActual = tab.dataset.filtro;
    renderizarReservas();
  });
});

async function obtenerReservas() {
  try {
    const respuesta = await fetch("./data/reservas.json");
    if (!respuesta.ok) throw new Error("Error al consultar el JSON");
    
    listaReservas = await respuesta.json();
    renderizarReservas();
  } catch (error) {
    console.warn("Cargando datos locales de respaldo...", error);
    listaReservas = reservasRespaldo;
    renderizarReservas();
  }
}

obtenerReservas();