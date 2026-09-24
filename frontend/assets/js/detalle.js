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

async function cargarDetalle() {
  if (elNombre) elNombre.textContent = "Cargando detalle del alojamiento...";

  try {
    const respuesta = await fetch("data/catalogo.json");
    if (!respuesta.ok) throw new Error("Error al obtener los datos del servidor");

    const datosJson = await respuesta.json();

    const datosLocalStorage = JSON.parse(localStorage.getItem("alojamientosPublicados")) || [];

    const todosLosDatos = [...datosLocalStorage, ...datosJson];

    const alojamientos = todosLosDatos.map((item) => ({
      id: String(item.id),
      titulo: item.titulo || item.nombre,
      imagen: item.imagen || "",
      descripcion: item.descripcion || "Excelente alojamiento completamente equipado para disfrutar de una estadía cómoda.",
      ubicacion: item.ubicacion || "Santa Fe",
      precio: item.precioNoche || item.precio || 45000,
      capacidad: item.capacidad || item.huespedes || 4
    }));

    const encontrado = alojamientos.find((item) => item.id === String(idAlojamiento));

    if (encontrado) {
      if (elNombre) elNombre.textContent = encontrado.titulo;

      if (elImagen) {
        if (encontrado.imagen && encontrado.imagen.trim() !== "") {
          elImagen.src = encontrado.imagen;
          elImagen.alt = encontrado.titulo;
          elImagen.style.display = "block";
        } else {
          elImagen.style.display = "none";
        }
      }

      if (elDescripcion) elDescripcion.textContent = encontrado.descripcion;
      if (elUbicacion) elUbicacion.textContent = encontrado.ubicacion;
      if (elPrecio) elPrecio.textContent = Number(encontrado.precio).toLocaleString("es-AR");
      if (elCapacidad) elCapacidad.textContent = encontrado.capacidad;
    } else {
      if (elNombre) elNombre.textContent = "No se encontró el alojamiento solicitado.";
      console.error("No se encontró un alojamiento con id:", idAlojamiento);
    }
  } catch (error) {
    console.error("Error al cargar el detalle:", error);
    if (elNombre) elNombre.textContent = "Error al cargar la información del alojamiento.";
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