const parametrosURL = new URLSearchParams(window.location.search);
const idAlojamiento = parametrosURL.get("id");

const elNombre = document.querySelector("#nombreAlojamiento");
const elImagen = document.querySelector("#imagenAlojamiento");
const elDescripcion = document.querySelector("#descripcionTexto");
const elUbicacion = document.querySelector("#ubicacion");
const elPrecio = document.querySelector("#precio");
const elCapacidad = document.querySelector("#capacidad");
const formReserva = document.querySelector("#formReserva");
const mensajeReserva = document.querySelector("#mensajeReserva");
const elMensajeEstado = document.querySelector("#mensajeEstado");
const contenidoDetalle = document.querySelector("#contenidoDetalle");

const contenedorDetalle = document.querySelector(".detalle-alojamiento");

function mostrarMensaje(texto, tipo) {
  if (!elMensajeEstado) return;
  elMensajeEstado.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
  if (contenidoDetalle) contenidoDetalle.style.display = "none";
}

function ocultarMensaje() {
  if (elMensajeEstado) elMensajeEstado.innerHTML = "";
  if (contenidoDetalle) contenidoDetalle.style.display = "";
}

function mostrarDatos(alojamiento) {
  elNombre.textContent = alojamiento.titulo;
  elImagen.src = alojamiento.imagen;
  elImagen.alt = alojamiento.titulo;
  elDescripcion.textContent = alojamiento.descripcion;
  elUbicacion.textContent = alojamiento.ubicacion;
  elPrecio.textContent = alojamiento.precioNoche.toLocaleString("es-AR");
  elCapacidad.textContent = alojamiento.capacidad;
}

async function cargarDetalle() {
  mostrarMensaje("Cargando alojamiento...", "cargando"); 
  try {
    const respuesta = await fetch("./data/catalogo.json");
    if (!respuesta.ok) throw new Error("Error al cargar los datos");

    const datos = await respuesta.json();
    const encontrado = datos.find((item) => item.id === idAlojamiento);

    if (!encontrado) {
      mostrarMensaje("No encontramos ese alojamiento. Puede que el enlace esté roto.", "error");
      return;
    }
     ocultarMensaje();
    mostrarDatos(encontrado);


  } catch (error) {
    console.error("Error al cargar el detalle:", error);
    mostrarMensaje("No pudimos cargar el alojamiento. Probá recargar la página.", "error");
  }
}

if (formReserva) {
  formReserva.addEventListener("submit", function (evento) {
    evento.preventDefault();

    mensajeReserva.textContent = "";
    mensajeReserva.style.color = "red";

    const entrada = document.querySelector("#entrada").value;
    const salida = document.querySelector("#salida").value;
    const huespedes = document.querySelector("#huespedes").value;

    if (!entrada || !salida || !huespedes) {
      mensajeReserva.textContent = "Por favor, elegí las fechas y cantidad de huéspedes.";
      return;
    }

    if (new Date(entrada) >= new Date(salida)) {
      mensajeReserva.textContent = "La fecha de salida debe ser posterior a la de entrada.";
      return;
    }

    mensajeReserva.style.color = "green";
    mensajeReserva.textContent = "¡Reserva realizada con éxito! Redirigiendo a Mis Reservas...";

    setTimeout(() => {
      window.location.href = "reservas.html";
    }, 1500);
  });
}

cargarDetalle();