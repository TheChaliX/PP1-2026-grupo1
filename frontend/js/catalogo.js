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
          <p class="card-text"><strong>Tarifa:</strong> $${alojamiento.precioNoche.toLocaleString("es-AR")} por noche</p>
          <a href="detalle.html?id=${alojamiento.id}" class="btn btn-dark mt-auto">Ver detalle</a>
        </div>
      </div>
    </div>
  `;
}

function renderizarCatalogo(lista) {
  if (!contenedorCatalogo) return;

  
  if (lista.length === 0) {
    contenedorCatalogo.innerHTML = `<p class="col-12 text-center text-muted">No se encontraron alojamientos que coincidan con la búsqueda.</p>`;
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

async function cargarCatalogo() {
  if (!contenedorCatalogo) return;

  
  contenedorCatalogo.innerHTML = `<p class="col-12 text-center text-info">Cargando catálogo de alojamientos...</p>`;

  try {
    const respuesta = await fetch("data/reservas.json");
    if (!respuesta.ok) throw new Error("Error al cargar JSON");

    const datos = await respuesta.json();

    
    alojamientos = datos.map((item) => {
      let ubicacion = "Santa Fe";
      const titulo = item.titulo.toLowerCase();

      if (titulo.includes("montañas") || titulo.includes("sierras")) ubicacion = "Córdoba Capital";
      else if (titulo.includes("cabaña") || titulo.includes("pileta")) ubicacion = "Villa Carlos Paz";
      else if (titulo.includes("río") || titulo.includes("rosario")) ubicacion = "Rosario";
      else if (titulo.includes("lago") || titulo.includes("bariloche")) ubicacion = "Bariloche";
      else if (titulo.includes("viñedos") || titulo.includes("mendoza")) ubicacion = "Mendoza";
      else if (titulo.includes("colonial") || titulo.includes("salta")) ubicacion = "Salta";
      else if (titulo.includes("playa") || titulo.includes("duplex")) ubicacion = "Mar del Plata";

      return {
        id: item.id,
        nombre: item.titulo,
        ubicacion: ubicacion,
        precioNoche: (item.huespedes || 3) * 15000, // Calcula un precio dinámico coherente por cantidad de huéspedes
        imagen: item.imagen
      };
    });

    renderizarCatalogo(alojamientos);
  } catch (error) {
    
    console.error("Error al obtener catálogo:", error);
    contenedorCatalogo.innerHTML = `<p class="col-12 text-center text-danger">Ocurrió un error al cargar el catálogo. Por favor, intentá nuevamente más tarde.</p>`;
  }
}

cargarCatalogo();