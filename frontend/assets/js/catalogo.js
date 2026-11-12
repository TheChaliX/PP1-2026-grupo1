// catalogo.js
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
const formFiltros        = document.querySelector("#formFiltros");
const inputUbicacion     = document.querySelector("#ubicacion");
const inputTarifaMin     = document.querySelector("#tarifa-minima");
const inputTarifaMax     = document.querySelector("#tarifa-maxima");
const mensajeFiltros     = document.querySelector("#mensaje-filtros");
const inputLlegada       = document.querySelector("#fecha-entrada");
const inputSalida        = document.querySelector("#fecha-salida");

//acceso a la API
const API_URL = `${API_BASE}/hospedajes`;

let alojamientos = [];

function crearBadge(alojamiento) {
  if (alojamiento.destacado === "oferta") return `<span class="badge-flotante badge-oferta">Oferta especial</span>`;
  if (alojamiento.destacado === "top")    return `<span class="badge-flotante badge-top">¡Mejor puntuado!</span>`;
  return "";
}

function crearRating(alojamiento) {
  if (!alojamiento.calificacion) return "";
  return `
    <div class="rating">
      <span class="rating-estrellas" style="--puntaje: ${alojamiento.calificacion};" aria-label="${alojamiento.calificacion} de 5 estrellas"></span>
      <span class="rating-valor">${alojamiento.calificacion.toFixed(1)}</span>
      <span class="rating-reviews">(${alojamiento.resenas || 0} reseñas)</span>
    </div>
  `;
}

function crearChipsServicios(servicios) {
  if (!servicios || servicios.length === 0) return "";
  const visibles = servicios.slice(0, 3);
  const extras   = servicios.length > 3 ? `<span class="chip chip-extra">+${servicios.length - 3}</span>` : "";
  return `<div class="chips-servicios">
    ${visibles.map((s) => `<span class="chip"><i class="bi ${iconosServicios[s] || "bi-check-circle"}"></i> ${s}</span>`).join("")}
    ${extras}
  </div>`;
}

function crearTarjeta(alojamiento) {
  const imgHtml = alojamiento.imagen
    ? `<img src="${alojamiento.imagen}" class="card-img-top" alt="${alojamiento.nombre}" loading="lazy">`
    : `<div class="card-img-placeholder"><i class="bi bi-image"></i></div>`;

  return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        <div class="card-img-wrapper">
          ${crearBadge(alojamiento)}
          ${imgHtml}
        </div>
        <div class="card-body d-flex flex-column">
          <h3 class="card-title h5">${alojamiento.nombre}</h3>
          ${crearRating(alojamiento)}
          <p class="card-text mb-1"><i class="bi bi-geo-alt-fill text-danger"></i> ${alojamiento.ubicacion}</p>
          <p class="card-text card-precio"><strong>$${alojamiento.precioNoche.toLocaleString("es-AR")}</strong> <span>/ noche</span></p>
          ${crearChipsServicios(alojamiento.servicios)}
          <a href="detalle.html?id=${alojamiento.id}" class="btn btn-dark mt-auto btn-ver-detalle">Ver detalle <i class="bi bi-arrow-right"></i></a>
        </div>
      </div>
    </div>
  `;
}

function mostrarMensajeFiltros(texto, tipo = "vacio") {
  if (!mensajeFiltros) return;
  mensajeFiltros.className = `mensaje-filtros mensaje-filtros-${tipo}`;
  mensajeFiltros.innerHTML = tipo === "vacio"
    ? `<i class="bi bi-search"></i> ${texto}`
    : `<i class="bi bi-exclamation-triangle"></i> ${texto}`;
  mensajeFiltros.style.display = "block";
}

function ocultarMensajeFiltros() {
  if (mensajeFiltros) mensajeFiltros.style.display = "none";
}

function renderizarCatalogo(lista) {
  if (!contenedorCatalogo) return;
  ocultarMensajeFiltros();

  if (lista.length === 0) {
    contenedorCatalogo.innerHTML = "";
    mostrarMensajeFiltros("No se encontraron alojamientos con esos filtros. Probá con otros criterios.");
    return;
  }

  contenedorCatalogo.innerHTML = lista.map(crearTarjeta).join("");
}

function adaptarHospedaje(item) {
  return {
    id:           item.id,
    nombre:       item.nombre,
    ubicacion:    item.ciudad,
    precioNoche:  item.precioPorNoche,
    imagen:       item.imagen || null,
    imagenes:     item.imagenes || (item.imagen ? [item.imagen] : []),
    calificacion: item.calificacion || null,
    resenas:      item.resenas || 0,
    servicios:    item.servicios || [],
    destacado:    item.destacado || null
  };
}

function hoyISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// no deja elegir fechas pasadas ni una salida antes de la llegada
if (inputLlegada && inputSalida) {
  inputLlegada.min = hoyISO();
  inputSalida.min  = hoyISO();
  inputLlegada.addEventListener("change", () => {
    if (inputLlegada.value) inputSalida.min = inputLlegada.value;
  });
}

// con fechas le pedimos al back solo los libres, sin fechas usamos la lista que ya tenemos
async function buscarPorFechas(llegada, salida) {
  if (!llegada && !salida) return alojamientos;
  if (!llegada || !salida) throw new Error("Elegí la fecha de llegada y la de salida.");
  if (llegada < hoyISO()) throw new Error("La llegada no puede ser antes de hoy.");
  if (salida <= llegada) throw new Error("La salida tiene que ser después de la llegada.");

  const respuesta = await fetch(`${API_URL}?entrada=${llegada}&salida=${salida}`);
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.mensaje || "No se pudo buscar por fechas.");
  }
  return (await respuesta.json()).map(adaptarHospedaje);
}

if (formFiltros) {
  formFiltros.addEventListener("submit", async function (e) {
    e.preventDefault();

    let base;
    try {
      base = await buscarPorFechas(inputLlegada?.value, inputSalida?.value);
    } catch (error) {
      contenedorCatalogo.innerHTML = "";
      mostrarMensajeFiltros(error.message, "error");
      return;
    }

    const ubicacionTexto = inputUbicacion.value.toLowerCase().trim();
    const min = Number(inputTarifaMin.value) || 0;
    const max = Number(inputTarifaMax.value) || Infinity;

    const serviciosMarcados = [...document.querySelectorAll('.servicio-check input[type="checkbox"]:checked')]
      .map((cb) => cb.value);

    const filtrados = base.filter((a) => {
      const coincideUbicacion  = !ubicacionTexto || a.ubicacion.toLowerCase().includes(ubicacionTexto);
      const coincidePrecio     = a.precioNoche >= min && a.precioNoche <= max;
      const coincideServicios  = serviciosMarcados.length === 0 ||
        serviciosMarcados.every((s) => (a.servicios || []).includes(s));
      return coincideUbicacion && coincidePrecio && coincideServicios;
    });

    renderizarCatalogo(filtrados);
  });
}

// carga los servicios para el filtro
async function cargarFiltroServicios() {
  const contenedor = document.querySelector("#filtroServicios");
  if (!contenedor) return;
  try {
    const respuesta = await fetch(`${API_BASE}/servicios`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const servicios = await respuesta.json();
    contenedor.replaceChildren(...servicios.map((nombre) => {
      const label = document.createElement("label");
      label.className = "servicio-check m-0";
      label.innerHTML = `<input type="checkbox"> <span><i class="bi ${iconoServicio(nombre)}"></i> </span>`;
      label.querySelector("input").value = nombre;
      label.querySelector("span").append(nombre);
      return label;
    }));
  } catch (error) {
    console.error("No se pudieron cargar los servicios:", error);
  }
}

async function cargarCatalogo() {
  if (!contenedorCatalogo) return;
  contenedorCatalogo.innerHTML = `<p class="col-12 text-center text-info py-4"><i class="bi bi-arrow-repeat spin"></i> Cargando alojamientos...</p>`;

  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error al cargar catálogo");
    const datosApi = await respuesta.json();

    alojamientos = datosApi.map(adaptarHospedaje);

    renderizarCatalogo(alojamientos);
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    contenedorCatalogo.innerHTML = "";
    mostrarMensajeFiltros("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.", "error");
  }
}

cargarFiltroServicios();
cargarCatalogo();
