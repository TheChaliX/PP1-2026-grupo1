// detalle.js — Frontend Mockup PP1 2026
const parametrosURL  = new URLSearchParams(window.location.search);
const idAlojamiento  = parametrosURL.get("id");

const elNombre         = document.querySelector("#nombreAlojamiento");
const elImagen         = document.querySelector("#imagenAlojamiento");
const elDescripcion    = document.querySelector("#descripcionTexto");
const elUbicacion      = document.querySelector("#ubicacion");
const elPrecio         = document.querySelector("#precio");
const elCapacidad      = document.querySelector("#capacidad");
const elAnfitrion      = document.querySelector("#anfitrion");
const elRating         = document.querySelector("#ratingAlojamiento");
const elListaServicios = document.querySelector("#listaServicios");
const formReserva      = document.querySelector("#formReserva");

const iconosServicios = {
  "Wi-Fi":              "bi-wifi",
  "Cocina":             "bi-cup-hot",
  "Pileta":             "bi-water",
  "Estacionamiento":    "bi-p-circle",
  "Desayuno":           "bi-cup-hot-fill",
  "Parrilla":           "bi-fire",
  "Vista panorámica":   "bi-binoculars",
  "Aire acondicionado": "bi-snow2",
  "TV":                 "bi-tv"
};

const usuario = obtenerUsuarioActivo();
const seccionReserva = document.querySelector(".disponibilidad");
if (seccionReserva) {
  if (!usuario) {
    seccionReserva.innerHTML = `<div class="aviso-sesion"><p><i class="bi bi-lock-fill"></i> Necesitás iniciar sesión para reservar.</p><a href="login.html" class="btn-reserve">Iniciar sesión</a></div>`;
  } else if (usuario.rol === "anfitrion") {
    seccionReserva.innerHTML = `<div class="aviso-sesion aviso-info"><p><i class="bi bi-info-circle-fill"></i> Los anfitriones no pueden reservar.</p></div>`;
  }
}

function crearRating(alojamiento) {
  if (!elRating || !alojamiento.calificacion) return;
  elRating.innerHTML = `<div class="rating"><span class="rating-estrellas" style="--puntaje: ${alojamiento.calificacion};"></span><span class="rating-valor">${alojamiento.calificacion.toFixed(1)}</span></div>`;
}

function crearListaServicios(servicios) {
  if (!elListaServicios) return;
  if (!servicios || servicios.length === 0) {
    elListaServicios.innerHTML = "<li>No se especificaron servicios.</li>";
    return;
  }
  elListaServicios.innerHTML = servicios.map((s) => `<li><i class="bi ${iconosServicios[s] || "bi-check-circle"}"></i> ${s}</li>`).join("");
}

async function cargarDetalle() {
  if (elNombre) elNombre.textContent = "Cargando...";
  try {
    const respuesta = await fetch("data/catalogo.json");
    if (!respuesta.ok) throw new Error("Error de red");
    const datosJson = await respuesta.json();
    const encontrado = datosJson.find((item) => String(item.id) === String(idAlojamiento));

    if (!encontrado) {
      if (elNombre) elNombre.textContent = "Alojamiento no encontrado.";
      return;
    }

    if (elNombre)      elNombre.textContent = encontrado.titulo || encontrado.nombre;
    if (elDescripcion) elDescripcion.textContent = encontrado.descripcion || "";
    if (elUbicacion)   elUbicacion.textContent = encontrado.ubicacion || "";
    if (elPrecio)      elPrecio.textContent = Number(encontrado.precioNoche || 0).toLocaleString("es-AR");
    if (elCapacidad)   elCapacidad.textContent = encontrado.capacidad || 1;
    if (elAnfitrion)   elAnfitrion.textContent = encontrado.anfitrion || "Anfitrión";

    if (elImagen && encontrado.imagen) {
      elImagen.src = encontrado.imagen;
      elImagen.style.display = "block";
    }

    crearRating(encontrado);
    crearListaServicios(encontrado.servicios);

    // En vez de localStorage, traemos reservas mockup para mostrar alguna
    if (usuario) {
      const respR = await fetch("data/reservas.json");
      if (respR.ok) {
        const reservasMock = await respR.json();
        const reservasDeEste = reservasMock.filter(r => String(r.alojamientoId) === String(idAlojamiento)).slice(0, 2);
        const elLista = document.querySelector("#listaReservas");
        if (elLista) {
          elLista.innerHTML = reservasDeEste.length === 0 ? "<p class='text-muted'>Sin reservas previas.</p>" : 
            reservasDeEste.map(r => `<div class="reserva-previa"><span><i class="bi bi-calendar-event"></i> ${r.fechas}</span></div>`).join("");
        }
      }
    }
  } catch (err) {
    if (elNombre) elNombre.textContent = "Error al cargar el alojamiento.";
  }
}

if (formReserva && usuario && usuario.rol === "huesped") {
  formReserva.addEventListener("submit", function (e) {
    e.preventDefault();
    mostrarModal("¡Reserva solicitada! Redirigiendo a Mis Reservas...", "exito");
    setTimeout(() => { window.location.href = "reservas.html"; }, 1500);
  });
}

cargarDetalle();
