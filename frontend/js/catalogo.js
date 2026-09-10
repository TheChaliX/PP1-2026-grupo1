// 1. Referencias al DOM
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
const formFiltros = document.querySelector("#formFiltros");
const inputUbicacion = document.querySelector("#ubicacion");
const inputTarifaMin = document.querySelector("#tarifa-minima");
const inputTarifaMax = document.querySelector("#tarifa-maxima");

let alojamientos = [];

// 2. Función para crear el HTML de la tarjeta respetando tus clases de Bootstrap
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

// 3. Renderizado del catálogo (Clase 16)
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

// 4. Filtrado dinamico al enviar el formulario (Clase 17)
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

// 5. Carga de datos con Fetch desde el JSON (Clase 18)
async function cargarCatalogo() {
  try {
    const respuesta = await fetch("./data/reservas.json");
    if (!respuesta.ok) throw new Error("Error al cargar JSON");

    const datos = await respuesta.json();
    
    // Mapeamos los datos para adaptarlos al formato del catálogo
    alojamientos = datos.map((item) => ({
      id: item.id,
      nombre: item.titulo,
      ubicacion: item.titulo.includes("montañas") ? "Córdoba Capital" : item.titulo.includes("Cabaña") ? "Villa Carlos Paz" : "Santa Fe",
      precioNoche: item.id === "cordoba" ? 45000 : item.id === "villacp" ? 70000 : 78000,
      imagen: item.imagen
    }));

    renderizarCatalogo(alojamientos);
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
  }
}

cargarCatalogo();