
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


const alojamientos = [
  {
    id: "cordoba",
    titulo: "Casa en las montañas",
    imagen: "img/img-cordoba.jpg",
    descripcion: "Hermosa casa ubicada en las sierras, ideal para descansar y conectar con la naturaleza.",
    ubicacion: "Córdoba Capital",
    precio: 45000,
    capacidad: 4,
    anfitrion: "Gaspar Pérez"
  },
  {
    id: "villacp",
    titulo: "Cabaña con pileta",
    imagen: "img/img-villacp.webp",
    descripcion: "Cabaña totalmente equipada con pileta privada y excelente vista al lago.",
    ubicacion: "Villa Carlos Paz",
    precio: 70000,
    capacidad: 6,
    anfitrion: "María González"
  },
  {
    id: "santafe",
    titulo: "Casa quinta con pileta",
    imagen: "img/img-santafe.jpg",
    descripcion: "Amplia casa quinta ideal para familias numerosas o grupos de amigos.",
    ubicacion: "Santa Fe",
    precio: 78000,
    capacidad: 8,
    anfitrion: "Lucas Fernández"
  }
];


function cargarDetalle() {

  const encontrado = alojamientos.find((item) => item.id === idAlojamiento);

  if (encontrado) {
    elNombre.textContent = encontrado.titulo;
    elImagen.src = encontrado.imagen;
    elImagen.alt = encontrado.titulo;
    elDescripcion.textContent = encontrado.descripcion;
    elUbicacion.textContent = encontrado.ubicacion;
    elPrecio.textContent = encontrado.precio.toLocaleString("es-AR");
    elCapacidad.textContent = encontrado.capacidad;
  } else {
    
    const porDefecto = alojamientos[0];
    elNombre.textContent = porDefecto.titulo;
    elImagen.src = porDefecto.imagen;
    elImagen.alt = porDefecto.titulo;
    elDescripcion.textContent = porDefecto.descripcion;
    elUbicacion.textContent = porDefecto.ubicacion;
    elPrecio.textContent = porDefecto.precio.toLocaleString("es-AR");
    elCapacidad.textContent = porDefecto.capacidad;
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