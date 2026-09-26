// catalogo.js — Frontend Mockup PP1 2026
const contenedorCatalogo = document.querySelector("#contenedor-catalogo");
const formFiltros        = document.querySelector("#formFiltros");
const inputUbicacion     = document.querySelector("#ubicacion");
const inputTarifaMin     = document.querySelector("#tarifa-minima");
const inputTarifaMax     = document.querySelector("#tarifa-maxima");
const mensajeFiltros     = document.querySelector("#mensaje-filtros");

let alojamientos = [];

const iconosServicios = {
  "Wi-Fi":               "bi-wifi",
  "Cocina":              "bi-cup-hot",
  "Pileta":              "bi-water",
  "Estacionamiento":     "bi-p-circle",
  "Desayuno":            "bi-cup-hot-fill",
  "Parrilla":            "bi-fire",
  "Vista panorámica":    "bi-binoculars",
  "Aire acondicionado":  "bi-snow2",
  "TV":                  "bi-tv"
};

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

if (formFiltros) {
  formFiltros.addEventListener("submit", function (e) {
    e.preventDefault();

    const ubicacionTexto = inputUbicacion.value.toLowerCase().trim();
    const min = Number(inputTarifaMin.value) || 0;
    const max = Number(inputTarifaMax.value) || Infinity;

    const serviciosMarcados = [...document.querySelectorAll('.servicio-check input[type="checkbox"]:checked')]
      .map((cb) => cb.value);

    const filtrados = alojamientos.filter((a) => {
      const coincideUbicacion  = !ubicacionTexto || a.ubicacion.toLowerCase().includes(ubicacionTexto);
      const coincidePrecio     = a.precioNoche >= min && a.precioNoche <= max;
      const coincideServicios  = serviciosMarcados.length === 0 ||
        serviciosMarcados.every((s) => (a.servicios || []).includes(s));
      return coincideUbicacion && coincidePrecio && coincideServicios;
    });

    renderizarCatalogo(filtrados);
  });
}

async function cargarCatalogo() {
  if (!contenedorCatalogo) return;
  contenedorCatalogo.innerHTML = `<p class="col-12 text-center text-info py-4"><i class="bi bi-arrow-repeat spin"></i> Cargando alojamientos...</p>`;

  try {
    const respuesta = await fetch("data/catalogo.json");
    if (!respuesta.ok) throw new Error("Error al cargar catálogo");
    const datosJson = await respuesta.json();

    alojamientos = datosJson.map((item) => ({
      id:           item.id,
      nombre:       item.titulo || item.nombre,
      ubicacion:    item.ubicacion,
      precioNoche:  item.precioNoche,
     imagen: item.imagen,
imagenes: item.imagenes || [item.imagen],
calificacion: item.calificacion || null,
      resenas:      item.resenas || 0,
      servicios:    item.servicios || [],
      destacado:    item.destacado || null
    }));

    renderizarCatalogo(alojamientos);
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    contenedorCatalogo.innerHTML = "";
    mostrarMensajeFiltros("Ocurrió un error al cargar el catálogo.", "error");
  }
}

cargarCatalogo();
