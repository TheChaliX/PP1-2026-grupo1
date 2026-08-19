/*
============================
1. Datos de los alojamientos 
============================
*/ 
const alojamientos = {
cordoba: {
    nombre: "Casa en las montañas",
    imagen: "img/img-cordoba.jpg",
    anfitrion: "Gaspar Pérez",
    descripcion: "Casa ubicada en una zona de montaña ideal para descansar, disfrutar de la naturaleza y pasar unos días de tranquilidad.",
    ubicacion: "Villa General Belgrano",
    precio: "45.000",
    capacidad: 6
},
villacp: {
    nombre: "Cabaña con pileta",
    imagen: "img/img-villacp.webp",
    anfitrion: "Nombre del anfitrión",
    descripcion: "Descripción de la cabaña con pileta.",
    ubicacion: "Ubicación pendiente",
    precio: "12.000",
    capacidad: 2
},
santafe: {
    nombre: "Casa quinta con pileta",
    imagen: "img/img-santafe.jpg",
    anfitrion: "Nombre del anfitrión",
    descripcion: "Descripción de la casa quinta.",
    ubicacion: "Ubicación pendiente",
    precio: "18.000",
    capacidad: 6
}
};

// Leer el id de la URL
const parametros = new URLSearchParams(window.location.search);
const idAlojamiento = parametros.get("id");
const datos = alojamientos[idAlojamiento];

//Referencias al form
const elementoNombre = document.getElementById("nombreAlojamiento");
const elementoImagen = document.getElementById("imagenAlojamiento");
const elementoAnfitrion = document.getElementById("anfitrion");
const elementoDescripcion = document.getElementById("descripcion");
const elementoUbicacion = document.getElementById("ubicacion");
const elementoPrecio = document.getElementById("precio");
const elementoCapacidad = document.getElementById("capacidad");

//Función que vuelca los datos en el HTML
function mostrarAlojamiento(alojamiento) {
elementoNombre.textContent = alojamiento.nombre;
elementoImagen.src = alojamiento.imagen;
elementoImagen.alt = alojamiento.nombre;
elementoAnfitrion.textContent = alojamiento.anfitrion;
elementoDescripcion.textContent = alojamiento.descripcion;
elementoUbicacion.textContent = alojamiento.ubicacion;
elementoPrecio.textContent = alojamiento.precio;
elementoCapacidad.textContent = alojamiento.capacidad;
}

//Ejecutar, con control de error si el id no existe
if (datos) {
mostrarAlojamiento(datos);
} else {
elementoNombre.textContent = "Alojamiento no encontrado";
}