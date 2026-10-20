// detalle.js — PP1 2026 Grupo 1
const parametrosURL  = new URLSearchParams(window.location.search);
const idAlojamiento  = parametrosURL.get("id");

const elNombre         = document.querySelector("#nombreAlojamiento");
const elDescripcion    = document.querySelector("#descripcionTexto");
const elUbicacion      = document.querySelector("#ubicacion");
const elPrecio         = document.querySelector("#precio");
const elCapacidad      = document.querySelector("#capacidad");
const elAnfitrion      = document.querySelector("#anfitrion");
const elRating         = document.querySelector("#ratingAlojamiento");
const elListaServicios = document.querySelector("#listaServicios");
const formReserva      = document.querySelector("#formReserva");

// Acceso a la API
const API_URL          = "http://localhost:8080/api/hospedajes";
const API_RESERVAS_URL = "http://localhost:8080/api/reservas";

const MAX_NOCHES = 30;
let capacidadAlojamiento = null;

const iconosServicios = {
  "Wi-Fi":              "bi-wifi",
  "Cocina":             "bi-cup-hot",
  "Pileta":             "bi-water",
  "Estacionamiento":    "bi-p-circle",
  "Desayuno":           "bi-cup-hot-fill",
  "Parrilla":           "bi-fire",
  "Vista panorámica":   "bi-binoculars",
  "Aire acondicionado": "bi-snow2",
  "TV":                 "bi-tv",
  "Calefacción":         "bi-thermometer-sun",
  "Lavandería":          "bi-bag-heart",
  "Jacuzzi":             "bi-droplet-half",
  "Mascotas permitidas": "bi-heart",
  "Apto para niños":     "bi-emoji-smile",
  "Seguridad 24h":       "bi-shield-check",
  "Gym":                 "bi-bicycle"
};

const usuario = obtenerUsuarioActivo();
const seccionReserva = document.querySelector(".disponibilidad");
if (seccionReserva) {
  if (!usuario) {
    seccionReserva.innerHTML = `<div class="aviso-sesion"><p><i class="bi bi-lock-fill"></i> Necesitás iniciar sesión para reservar.</p><a href="login.html" class="btn-reserve">Iniciar sesión</a></div>`;
  } else if (usuario.rol === "anfitrion") {
    seccionReserva.innerHTML = `<div class="aviso-sesion aviso-info"><p><i class="bi bi-info-circle-fill"></i> Los anfitriones no pueden reservar. Cambiá a modo huésped para hacerlo.</p></div>`;
  }
}

// ── Utilidades ─────────────────────────────────────────────────────────────
function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
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

// ── Fechas ocupadas (reservas activas del alojamiento) ─────────────────────
async function cargarOcupacion() {
  const elLista = document.querySelector("#listaReservas");
  if (!elLista) return;

  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/hospedaje/${idAlojamiento}/ocupacion`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const ocupadas = await respuesta.json();

    elLista.innerHTML = ocupadas.length === 0
      ? "<p class='text-muted'>Sin reservas por ahora: todas las fechas están disponibles.</p>"
      : ocupadas.map((o) => `<div class="reserva-previa"><span><i class="bi bi-calendar-event"></i> ${formatearFecha(o.fechaCheckIn)} → ${formatearFecha(o.fechaCheckOut)}</span></div>`).join("");
  } catch (error) {
    console.error("Error al cargar las fechas ocupadas:", error);
    elLista.innerHTML = "<p class='text-muted'>No se pudieron cargar las fechas ocupadas.</p>";
  }
}

// ── Detalle del alojamiento ────────────────────────────────────────────────
async function cargarDetalle() {
  if (elNombre) elNombre.textContent = "Cargando...";
  try {
    if (!idAlojamiento) {
      if (elNombre) elNombre.textContent = "Alojamiento no encontrado.";
      return;
    }

    const respuesta = await fetch(`${API_URL}/${idAlojamiento}`);
    if (respuesta.status === 404) {
      if (elNombre) elNombre.textContent = "Alojamiento no encontrado.";
      return;
    }
    if (!respuesta.ok) throw new Error("Error de red");
    const item = await respuesta.json();

    const encontrado = {
      id:           item.id,
      nombre:       item.nombre,
      descripcion:  item.descripcion,
      ubicacion:    item.ciudad,
      precioNoche:  item.precioPorNoche,
      capacidad:    item.capacidad,
      anfitrion:    item.anfitrion,
      imagen:       item.imagen || null,
      imagenes:     item.imagenes || (item.imagen ? [item.imagen] : []),
      calificacion: item.calificacion || null,
      servicios:    item.servicios || []
    };

    capacidadAlojamiento = encontrado.capacidad;

    if (elNombre)      elNombre.textContent = encontrado.nombre;
    if (elDescripcion) elDescripcion.textContent = encontrado.descripcion || "";
    if (elUbicacion)   elUbicacion.textContent = encontrado.ubicacion || "";
    if (elPrecio)      elPrecio.textContent = Number(encontrado.precioNoche || 0).toLocaleString("es-AR");
    if (elCapacidad)   elCapacidad.textContent = encontrado.capacidad || 1;
    if (elAnfitrion)   elAnfitrion.textContent = encontrado.anfitrion || "Anfitrión";

    const galeria = document.querySelector(".galeria");

    if (galeria) {
      // Si el alojamiento todavía no tiene cargado el array "imagenes"
      // (galería completa), usamos su foto de portada ("imagen") como
      // única foto en vez de dejar la galería vacía.
      const todasLasImagenes = (encontrado.imagenes && encontrado.imagenes.length)
        ? encontrado.imagenes
        : (encontrado.imagen ? [encontrado.imagen] : []);

      const imagenes = todasLasImagenes.slice(0, 5);
      const fotosRestantes = todasLasImagenes.length - imagenes.length;

      galeria.innerHTML = "";
      galeria.className = "galeria cant-" + Math.max(imagenes.length, 1);

      imagenes.forEach((imagen, index) => {
        const img = document.createElement("img");

        img.src = imagen;
        img.alt = `${encontrado.nombre || "Alojamiento"} - foto ${index + 1}`;
        img.className = "imagen-galeria";
        img.loading = index === 0 ? "eager" : "lazy";

        img.addEventListener("error", () => {
          console.error("No se pudo cargar la imagen:", imagen);
          img.style.display = "none";
        });

        img.addEventListener("click", () => {
          const visor = document.createElement("div");
          visor.className = "visor-imagen";
          visor.innerHTML = `
            <button class="cerrar-visor">
              <i class="bi bi-x-lg"></i>
            </button>
            <img src="${imagen}" alt="${img.alt}">
          `;

          document.body.appendChild(visor);

          visor.addEventListener("click", (e) => {
            if (e.target === visor || e.target.closest(".cerrar-visor")) {
              visor.remove();
            }
          });
        });

        galeria.appendChild(img);
      });

      // Si hay más de 5 fotos, mostramos un "+N" sobre la última
      // miniatura (en la misma celda de la grilla) en vez de agregar
      // más casilleros.
      if (fotosRestantes > 0) {
        const ultimaImagen = galeria.lastElementChild;
        const contadorExtra = document.createElement("div");
        contadorExtra.className = "galeria-mas-fotos";
        contadorExtra.textContent = `+${fotosRestantes} fotos`;

        const estiloUltima = getComputedStyle(ultimaImagen);
        contadorExtra.style.gridColumn = estiloUltima.gridColumn;
        contadorExtra.style.gridRow = estiloUltima.gridRow;

        galeria.appendChild(contadorExtra);
      }
    }

    crearRating(encontrado);
    crearListaServicios(encontrado.servicios);
    cargarOcupacion();
  } catch (err) {
    console.error("Error al cargar el alojamiento:", err);
    if (elNombre) elNombre.textContent = "Error al cargar el alojamiento.";
  }
}

// ── Formulario de reserva ──────────────────────────────────────────────────
const inputEntrada = document.querySelector("#entrada");
const inputSalida = document.querySelector("#salida");
const inputHuespedes = document.querySelector("#huespedes");
const mensajeReserva = document.querySelector("#mensajeReserva");
const errorEntrada = document.querySelector("#err-entrada");
const errorSalida = document.querySelector("#err-salida");
const errorHuespedes = document.querySelector("#err-huespedes");

// No se puede entrar antes de hoy
if (inputEntrada) inputEntrada.min = hoyISO();
if (inputSalida) inputSalida.min = hoyISO();

// La fecha de salida no puede ser anterior ni igual a la entrada
if (inputEntrada && inputSalida) {
  inputEntrada.addEventListener("change", function () {
    if (inputEntrada.value) {
      inputSalida.min = inputEntrada.value;

      // Si la salida ya elegida es inválida, la limpiamos
      if (inputSalida.value && inputSalida.value <= inputEntrada.value) {
        inputSalida.value = "";
      }
    }
  });
}

if (formReserva && usuario && usuario.rol === "huesped") {
  const botonReserva = formReserva.querySelector("button[type='submit']");

  formReserva.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Limpiar mensajes anteriores
    if (mensajeReserva) mensajeReserva.textContent = "";
    if (errorEntrada) errorEntrada.textContent = "";
    if (errorSalida) errorSalida.textContent = "";
    if (errorHuespedes) errorHuespedes.textContent = "";

    const fechaEntrada = inputEntrada.value;
    const fechaSalida = inputSalida.value;
    const cantidadHuespedes = Number(inputHuespedes.value);

    let hayError = false;

    // Fecha de entrada
    if (!fechaEntrada) {
      if (errorEntrada) errorEntrada.textContent = "Seleccioná una fecha de entrada.";
      hayError = true;
    } else if (fechaEntrada < hoyISO()) {
      if (errorEntrada) errorEntrada.textContent = "La fecha de entrada no puede ser anterior a hoy.";
      hayError = true;
    }

    // Fecha de salida
    if (!fechaSalida) {
      if (errorSalida) errorSalida.textContent = "Seleccioná una fecha de salida.";
      hayError = true;
    }

    // Orden de las fechas y estadía máxima
    if (fechaEntrada && fechaSalida) {
      if (fechaSalida <= fechaEntrada) {
        if (errorSalida) errorSalida.textContent = "La fecha de salida debe ser posterior a la fecha de entrada.";
        hayError = true;
      } else {
        const noches = Math.round((new Date(fechaSalida) - new Date(fechaEntrada)) / 86400000);
        if (noches > MAX_NOCHES) {
          if (errorSalida) errorSalida.textContent = `La estadía máxima es de ${MAX_NOCHES} noches.`;
          hayError = true;
        }
      }
    }

    // Cantidad de huéspedes
    if (!cantidadHuespedes || cantidadHuespedes < 1) {
      if (errorHuespedes) errorHuespedes.textContent = "Ingresá una cantidad válida de huéspedes.";
      hayError = true;
    } else if (capacidadAlojamiento && cantidadHuespedes > capacidadAlojamiento) {
      if (errorHuespedes) errorHuespedes.textContent = `Este alojamiento admite hasta ${capacidadAlojamiento} huéspedes.`;
      hayError = true;
    }

    if (hayError) return;

    if (!usuario.id) {
      mostrarModal("Volvé a iniciar sesión para reservar.", "error");
      return;
    }

    if (botonReserva) botonReserva.disabled = true;
    let reservada = false;

    try {
      const respuesta = await fetch(API_RESERVAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospedajeId:  Number(idAlojamiento),
          usuarioId:    usuario.id,
          fechaCheckIn:  fechaEntrada,
          fechaCheckOut: fechaSalida,
          huespedes:    cantidadHuespedes
        })
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({}));
        const mensaje = datos.mensaje
          || (respuesta.status === 409
            ? "El alojamiento no está disponible en esas fechas."
            : "No se pudo realizar la reserva.");
        if (mensajeReserva) {
          mensajeReserva.textContent = mensaje;
        } else {
          mostrarModal(mensaje, "error");
        }
        cargarOcupacion();
        return;
      }

      reservada = true;
      mostrarModal("¡Reserva confirmada! Redirigiendo a Mis Reservas...", "exito");

      setTimeout(() => {
        window.location.href = "reservas.html";
      }, 1500);
    } catch (error) {
      console.error("Error al reservar:", error);
      mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
    } finally {
      if (!reservada && botonReserva) botonReserva.disabled = false;
    }
  });
}

cargarDetalle();