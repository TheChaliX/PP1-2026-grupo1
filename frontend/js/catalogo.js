
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
const formFiltros = document.querySelector("#formFiltros");
const inputUbicacion = document.querySelector("#ubicacion");
const inputTarifaMin = document.querySelector("#tarifa-minima");
const inputTarifaMax = document.querySelector("#tarifa-maxima");

let alojamientos = [];


function crearTarjeta(alojamiento) {
  return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        <img src="${alojamiento.imagen}" class="card-img-top" alt="${alojamiento.nombre}">
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h5">${alojamiento.nombre}</h3>
          <p class="card-text mb-1"><strong>Ubicación:</strong> ${alojamiento.ubicacion}</p>
          <p class="card-text"><strong>Tarifa:</strong> $${alojamiento.precioNoche} por noche</p>
          <a href="detalle.html?id=${alojamiento.id}" class="btn btn-dark mt-auto">Ver detalle</a>
        </div>
      </div>
    </div>
  `;
}


function renderizarCatalogo(lista) {
  if (!contenedorCatalogo) return;

  if (lista.length === 0) {
    mostrarMensaje("No se encontraron alojamientos que coincidan con la búsqueda.", "vacio");
    return;
  }

  let htmlAcumulado = "";
  lista.forEach((item) => {
    htmlAcumulado += crearTarjeta(item);
  });

  contenedorCatalogo.innerHTML = htmlAcumulado;
}


if (formFiltros) {
  formFiltros.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const ubicacionTexto = inputUbicacion.value.toLowerCase().trim();
    const min = Number(inputTarifaMin.value) || 0;
    const max = Number(inputTarifaMax.value) || Infinity;

    const alojamientosFiltrados = alojamientos.filter((alojamiento) => {
      const coincideUbicacion = alojamiento.ubicacion.toLowerCase().includes(ubicacionTexto);
      const coincidePrecio = alojamiento.precioNoche >= min && alojamiento.precioNoche <= max;

      return coincideUbicacion && coincidePrecio;
    });

    renderizarCatalogo(alojamientosFiltrados);
  });
}

function mostrarMensaje(texto, tipo) {
  if (!contenedorCatalogo) return;
  contenedorCatalogo.innerHTML = `<p class="col-12 text-center mensaje ${tipo}">${texto}</p>`;
}

async function cargarCatalogo() {

  mostrarMensaje('cargando alojamientos..', 'Cargando');
  try {
    const respuesta = await fetch("./data/catalogo.json");
    if (!respuesta.ok) throw new Error("Error al cargar pagina, intenta recargar");

    const datos = await respuesta.json();
    
    
    alojamientos = datos.map((item) => ({                 //simplificamos .map , los datos vienen directos del json
  id: item.id,
  nombre: item.titulo,
  ubicacion: item.ubicacion,
  precioNoche: item.precioNoche,
  imagen: item.imagen
}));

    renderizarCatalogo(alojamientos);
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    mostrarMensaje('no pudimos cargar el catalogo. Proba recargar la pagina', 'error');
  }
}

cargarCatalogo();