// detalle.js — Frontend Mockup PP1 2026
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
        img.alt = `${encontrado.titulo || "Alojamiento"} - foto ${index + 1}`;

        img.className = "imagen-galeria";

        if (index === 0) {
            img.loading = "eager";
        } else {
            img.loading = "lazy";
        }

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

                <img 
                    src="${imagen}" 
                    alt="${img.alt}"
                >
            `;

            document.body.appendChild(visor);

            visor.addEventListener("click", (e) => {

                if (
                    e.target === visor ||
                    e.target.closest(".cerrar-visor")
                ) {
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

const inputEntrada = document.querySelector("#entrada");
const inputSalida = document.querySelector("#salida");
const inputHuespedes = document.querySelector("#huespedes");
const mensajeReserva = document.querySelector("#mensajeReserva");
const errorEntrada = document.querySelector("#err-entrada");
const errorSalida = document.querySelector("#err-salida");
const errorHuespedes = document.querySelector("#err-huespedes");


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

  formReserva.addEventListener("submit", function (e) {
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


    // ==========================================
    // VALIDAR FECHA DE ENTRADA
    // ==========================================

    if (!fechaEntrada) {
      if (errorEntrada) {
        errorEntrada.textContent = "Seleccioná una fecha de entrada.";
      }

      hayError = true;
    }


    // ==========================================
    // VALIDAR FECHA DE SALIDA
    // ==========================================

    if (!fechaSalida) {
      if (errorSalida) {
        errorSalida.textContent = "Seleccioná una fecha de salida.";
      }

      hayError = true;
    }


    // ==========================================
    // VALIDAR ORDEN DE LAS FECHAS
    // ==========================================

    if (
      fechaEntrada &&
      fechaSalida &&
      fechaSalida <= fechaEntrada
    ) {
      if (errorSalida) {
        errorSalida.textContent =
          "La fecha de salida debe ser posterior a la fecha de entrada.";
      }

      hayError = true;
    }


    // ==========================================
    // VALIDAR CANTIDAD DE HUÉSPEDES
    // ==========================================

    if (!cantidadHuespedes || cantidadHuespedes < 1) {
      if (errorHuespedes) {
        errorHuespedes.textContent =
          "Ingresá una cantidad válida de huéspedes.";
      }

      hayError = true;
    }


    // ==========================================
    // SI HAY ERROR, NO SE REALIZA LA RESERVA
    // ==========================================

    if (hayError) {
      return;
    }


    // ==========================================
    // RESERVA CORRECTA
    // ==========================================

    mostrarModal(
      "¡Reserva solicitada! Redirigiendo a Mis Reservas...",
      "exito"
    );

    setTimeout(() => {
      window.location.href = "reservas.html";
    }, 1500);
  });
}

cargarDetalle();
