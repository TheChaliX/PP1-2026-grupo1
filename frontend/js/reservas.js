const contenedorReservas = document.querySelector("#contenedor-reservas");
const tabs = document.querySelectorAll(".tabs a");

let listaReservas = [];
let filtroActual = "todas";
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

  
  const htmlImagen = reserva.imagen 
    ? `<img src="${reserva.imagen}" alt="${reserva.titulo}">` 
    : `<div class="reserva-sin-imagen" style="width: 150px; height: 100px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #666; font-size: 0.8rem;">Sin imagen</div>`;

  return `
    <article class="reserva ${reserva.estado}" data-id="${reserva.id}">
      ${htmlImagen}

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

  if (reservasFiltradas.length === 0) {
    contenedorReservas.innerHTML = "<p class='mensaje-vacio'>No se encontraron reservas en esta sección.</p>";
    return;
  }

  let htmlAcumulado = "";
  reservasFiltradas.forEach((reserva) => {
    htmlAcumulado += crearTarjetaReserva(reserva);
  });

  contenedorReservas.innerHTML = htmlAcumulado;
  escucharEventosAcciones();
}

async function cancelarReserva(idReserva) {
  const confirmar = confirm("¿Seguro que querés cancelar esta reserva?");

  if (confirmar) {
    const reserva = listaReservas.find((r) => r.id === idReserva);
    if (reserva) {
      reserva.estado = "cancelado";
      reserva.estadoTexto = "Cancelado";

      
      const datosLocalStorage = JSON.parse(localStorage.getItem("alojamientosPublicados")) || [];
      const indexLocal = datosLocalStorage.findIndex((r) => r.id === idReserva);
      if (indexLocal !== -1) {
        datosLocalStorage[indexLocal].estado = "cancelado";
        datosLocalStorage[indexLocal].estadoTexto = "Cancelado";
        localStorage.setItem("alojamientosPublicados", JSON.stringify(datosLocalStorage));
      }
    }
    renderizarReservas();
  }
}

function modificarReserva(idReserva) {
  window.location.href = `detalle.html?id=${idReserva}`;
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
  if (!contenedorReservas) return;

  contenedorReservas.innerHTML = "<p class='mensaje-cargando'>Cargando reservas...</p>";

  try {
    const respuesta = await fetch("data/reservas.json");
    if (!respuesta.ok) throw new Error("Error al consultar el servidor local");
    
    const datosJson = await respuesta.json();
    
    
    const datosLocalStorage = JSON.parse(localStorage.getItem("alojamientosPublicados")) || [];

    
    listaReservas = [...datosLocalStorage, ...datosJson];
    
    renderizarReservas();
  } catch (error) {
    console.error("Error al cargar JSON:", error);
    contenedorReservas.innerHTML = "<p class='mensaje-error'>Ocurrió un error al cargar las reservas. Intente nuevamente más tarde.</p>";
  }
}

obtenerReservas();