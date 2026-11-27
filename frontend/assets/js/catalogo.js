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


function crearBadge(alojamiento) {
  if (alojamiento.destacado === "oferta") return `<span class="badge-flotante badge-oferta">Oferta especial</span>`;
  if (alojamiento.destacado === "top")    return `<span class="badge-flotante badge-top">Destacado</span>`;
  return "";
}

function crearChipsServicios(servicios) {
  if (!servicios || servicios.length === 0) return "";
  // en una sola linea: dos extras y el resto como "+N", asi todas las tarjetas miden lo mismo
  const visibles = servicios.slice(0, 2);
  const extras   = servicios.length > 2 ? `<span class="chip chip-extra">+${servicios.length - 2}</span>` : "";
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
          <h3 class="card-title h5" title="${alojamiento.nombre}">${alojamiento.nombre}</h3>
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

// la casita girando mientras se espera al backend
function mostrarCargando(texto) {
  if (!contenedorCatalogo) return;
  ocultarMensajeFiltros();
  contenedorCatalogo.innerHTML = `
    <div class="col-12 loader-catalogo">
      <i class="bi bi-house-door-fill loader-casita"></i>
      <p>${texto}</p>
    </div>`;
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

// arma la URL con los filtros que se completaron; los vacios no se mandan
function armarFiltros() {
  const params  = new URLSearchParams();
  const destino = inputUbicacion?.value.trim();
  const llegada = inputLlegada?.value;
  const salida  = inputSalida?.value;
  const min     = inputTarifaMin?.value;
  const max     = inputTarifaMax?.value;

  if (llegada || salida) {
    if (!llegada || !salida) throw new Error("Elegí la fecha de llegada y la de salida.");
    if (llegada < hoyISO()) throw new Error("La llegada no puede ser antes de hoy.");
    if (salida <= llegada) throw new Error("La salida tiene que ser después de la llegada.");
  }
  if (min && max && Number(min) > Number(max)) {
    throw new Error("El precio mínimo no puede ser mayor que el máximo.");
  }

  if (destino) params.append("destino", destino);
  if (min)     params.append("precioMin", min);
  if (max)     params.append("precioMax", max);
  if (llegada) params.append("entrada", llegada);
  if (salida)  params.append("salida", salida);
  document.querySelectorAll('.servicio-check input[type="checkbox"]:checked')
    .forEach((cb) => params.append("servicios", cb.value));

  return params;
}

// el backend filtra todo en una sola consulta y devuelve solo los que coinciden
async function buscarAlojamientos(params) {
  const url = params.toString() ? `${API_URL}?${params}` : API_URL;
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    const datos = await respuesta.json().catch(() => ({}));
    throw new Error(datos.mensaje || "No se pudo buscar alojamientos.");
  }
  return (await respuesta.json()).map(adaptarHospedaje);
}

if (formFiltros) {
  const botonBuscar = formFiltros.querySelector("button[type='submit']");
  const textoBoton  = botonBuscar?.innerHTML;

  formFiltros.addEventListener("submit", async function (e) {
    e.preventDefault();
    // si ya esta buscando no hace nada, asi no se manda la misma busqueda varias veces
    if (botonBuscar?.disabled) return;

    let params;
    try {
      params = armarFiltros();
    } catch (error) {
      contenedorCatalogo.innerHTML = "";
      mostrarMensajeFiltros(error.message, "error");
      return;
    }

    if (botonBuscar) {
      botonBuscar.disabled = true;
      botonBuscar.innerHTML = `<i class="bi bi-hourglass-split"></i> Buscando...`;
    }
    mostrarCargando("Buscando alojamientos...");

    try {
      renderizarCatalogo(await buscarAlojamientos(params));
    } catch (error) {
      contenedorCatalogo.innerHTML = "";
      mostrarMensajeFiltros(error.message, "error");
    } finally {
      if (botonBuscar) {
        botonBuscar.disabled = false;
        botonBuscar.innerHTML = textoBoton;
      }
    }
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
  mostrarCargando("Cargando alojamientos...");

  try {
    renderizarCatalogo(await buscarAlojamientos(new URLSearchParams()));
  } catch (error) {
    console.error("Error al obtener catálogo:", error);
    contenedorCatalogo.innerHTML = "";
    mostrarMensajeFiltros("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.", "error");
  }
}

cargarFiltroServicios();
cargarCatalogo();
