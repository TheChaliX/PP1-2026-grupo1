console.log('funciona')   //habilita la consola con f12


//arrays para los alojamientos
const alojamientos = [
  { id: 1, nombre: 'Casa en las montañas', ubicacion: 'Cordoba Capital', capacidad: 4, precioNoche: 45000, imagen: 'img/img-cordoba.jpg' },
  { id: 2, nombre: 'Cabaña con pileta', ubicacion: 'Villa Carlos Paz', capacidad: 6, precioNoche: 70000, imagen: 'img/img-villacp.webp' },
  { id: 3, nombre: 'Monoambiente Moderno', ubicacion: 'Rosario', capacidad: 2, precioNoche: 38000, imagen: 'img/img-rosario.avif' },
  { id: 4, nombre: 'Casa quinta con pileta', ubicacion: 'Santa Fe', capacidad: 8, precioNoche: 78000, imagen: 'img/img-santafe.jpg' },
];

function crearTarjeta(alojamiento) {
  return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        <img src="${alojamiento.imagen}" class="card-img-top" alt="${alojamiento.nombre}">
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h5">${alojamiento.nombre}</h3>
          <p class="card-text mb-1"><strong>Ubicación:</strong> ${alojamiento.ubicacion} </p>
          <p class="card-text"><strong>Tarifa:</strong> $${alojamiento.precioNoche} por noche</p>
          <a href="detalle.html?id=${alojamiento.id}" class="btn btn-dark mt-auto">Ver detalle</a>
        </div>
      </div>
    </div>
`;
}