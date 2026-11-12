// detalle.js
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
const API_URL          = `${API_BASE}/hospedajes`;
const API_RESERVAS_URL = `${API_BASE}/reservas`;

const MAX_NOCHES = 30;
let capacidadAlojamiento = null;

const usuario = obtenerUsuarioActivo();
const seccionReserva = document.querySelector(".disponibilidad");
if (seccionReserva) {
  if (!usuario) {
    seccionReserva.innerHTML = `<div class="aviso-sesion"><p><i class="bi bi-lock-fill"></i> Necesitás iniciar sesión para reservar.</p><a href="login.html" class="btn-reserve">Iniciar sesión</a></div>`;
  } else if (usuario.rol === "anfitrion") {
    seccionReserva.innerHTML = `<div class="aviso-sesion aviso-info"><p><i class="bi bi-info-circle-fill"></i> Los anfitriones no pueden reservar. Cambiá a modo huésped para hacerlo.</p></div>`;
  }
}

// utilidades
function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
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

// fechas ocupadas
// guardamos las noches ocupadas (el dia de salida queda libre)
let nochesOcupadas = new Set();

function fechaISO(d) {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return fechaISO(new Date(anio, mes - 1, dia + dias));
}

async function cargarOcupacion() {
  try {
    const respuesta = await fetch(`${API_RESERVAS_URL}/hospedaje/${idAlojamiento}/ocupacion`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const ocupadas = await respuesta.json();

    nochesOcupadas = new Set();
    ocupadas.forEach((o) => {
      for (let noche = o.fechaCheckIn; noche < o.fechaCheckOut; noche = sumarDias(noche, 1)) {
        nochesOcupadas.add(noche);
      }
    });
    actualizarCalendarios();
  } catch (error) {
    console.error("Error al cargar las fechas ocupadas:", error);
  }
}

// visor de fotos
function abrirVisor(imagenes, indiceInicial, nombre) {
  let indice = indiceInicial;
  const variasFotos = imagenes.length > 1;

  const visor = document.createElement("div");
  visor.className = "visor-imagen";
  visor.innerHTML = `
    ${variasFotos ? `<button class="visor-flecha visor-anterior" aria-label="Foto anterior"><i class="bi bi-chevron-left"></i></button>` : ""}
    <div class="visor-contenido">
      <img class="visor-foto" alt="">
      <button class="cerrar-visor" aria-label="Cerrar"><i class="bi bi-x-lg"></i></button>
      ${variasFotos ? `<span class="visor-contador"></span>` : ""}
    </div>
    ${variasFotos ? `<button class="visor-flecha visor-siguiente" aria-label="Foto siguiente"><i class="bi bi-chevron-right"></i></button>` : ""}
  `;

  const foto     = visor.querySelector(".visor-foto");
  const contador = visor.querySelector(".visor-contador");

  function mostrar(nuevoIndice) {
    // si llega al final vuelve a la primera
    indice = (nuevoIndice + imagenes.length) % imagenes.length;
    foto.src = imagenes[indice];
    foto.alt = `${nombre || "Alojamiento"} - foto ${indice + 1}`;
    if (contador) contador.textContent = `${indice + 1} / ${imagenes.length}`;
  }

  function cerrar() {
    visor.remove();
    document.removeEventListener("keydown", teclas);
  }

  function teclas(e) {
    if (e.key === "Escape") cerrar();
    if (variasFotos && e.key === "ArrowLeft")  mostrar(indice - 1);
    if (variasFotos && e.key === "ArrowRight") mostrar(indice + 1);
  }

  visor.addEventListener("click", (e) => {
    if (e.target.closest(".visor-anterior"))  return mostrar(indice - 1);
    if (e.target.closest(".visor-siguiente")) return mostrar(indice + 1);
    if (e.target === visor || e.target.closest(".cerrar-visor")) cerrar();
  });
  document.addEventListener("keydown", teclas);

  mostrar(indice);
  document.body.appendChild(visor);
}

// detalle del alojamiento
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

    // si esta pausado no se puede reservar
    if (item.activo === false && seccionReserva) {
      seccionReserva.innerHTML = `<div class="aviso-sesion aviso-info"><p><i class="bi bi-pause-circle-fill"></i> Este alojamiento está pausado por el anfitrión y no recibe reservas por el momento.</p></div>`;
    }

    if (elNombre)      elNombre.textContent = encontrado.nombre;
    if (elDescripcion) elDescripcion.textContent = encontrado.descripcion || "";
    if (elUbicacion)   elUbicacion.textContent = encontrado.ubicacion || "";
    if (elPrecio)      elPrecio.textContent = Number(encontrado.precioNoche || 0).toLocaleString("es-AR");
    if (elCapacidad)   elCapacidad.textContent = encontrado.capacidad || 1;
    if (elAnfitrion)   elAnfitrion.textContent = encontrado.anfitrion || "Anfitrión";

    const galeria = document.querySelector(".galeria");

    if (galeria) {
      // si no tiene galeria usamos la portada
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

        img.addEventListener("click", () => abrirVisor(todasLasImagenes, index, encontrado.nombre));

        galeria.appendChild(img);
      });

      // si hay mas de 5 fotos mostramos "+N" en la ultima
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

// formulario de reserva
const inputEntrada = document.querySelector("#entrada");
const inputSalida = document.querySelector("#salida");
const inputHuespedes = document.querySelector("#huespedes");
const mensajeReserva = document.querySelector("#mensajeReserva");
const errorEntrada = document.querySelector("#err-entrada");
const errorSalida = document.querySelector("#err-salida");
const errorHuespedes = document.querySelector("#err-huespedes");

// calendarios con flatpickr, los dias ocupados no se pueden elegir
let calendarioEntrada = null;
let calendarioSalida  = null;

function marcarDiaOcupado(_fechas, _texto, _instancia, diaElem) {
  if (nochesOcupadas.has(fechaISO(diaElem.dateObj))) {
    diaElem.classList.add("dia-ocupado");
    diaElem.title = "Ocupado";
  }
}

// la salida no puede pasar la proxima fecha ocupada
function limiteSalida(entradaISO) {
  let limite = sumarDias(entradaISO, MAX_NOCHES);
  nochesOcupadas.forEach((noche) => {
    if (noche > entradaISO && noche < limite) limite = noche;
  });
  return limite;
}

function ajustarSalida() {
  if (!calendarioSalida) return;
  const entrada = inputEntrada.value;
  if (!entrada) {
    calendarioSalida.set("minDate", sumarDias(hoyISO(), 1));
    calendarioSalida.set("maxDate", null);
    return;
  }
  calendarioSalida.set("minDate", sumarDias(entrada, 1));
  calendarioSalida.set("maxDate", limiteSalida(entrada));

  // si la salida ya no sirve la borramos
  const salida = inputSalida.value;
  if (salida && (salida <= entrada || salida > limiteSalida(entrada))) {
    calendarioSalida.clear();
  }
}

function actualizarCalendarios() {
  if (calendarioEntrada) {
    calendarioEntrada.set("disable", [(fecha) => nochesOcupadas.has(fechaISO(fecha))]);
    calendarioEntrada.redraw();
  }
  if (calendarioSalida) {
    ajustarSalida();
    calendarioSalida.redraw();
  }
}

if (inputEntrada && inputSalida && typeof flatpickr === "function") {
  const opcionesComunes = {
    locale:     "es",
    dateFormat: "Y-m-d",
    altInput:   true,
    altFormat:  "d/m/Y",   // formato que se ve
    disableMobile: true,
    onDayCreate: marcarDiaOcupado
  };

  calendarioEntrada = flatpickr(inputEntrada, {
    ...opcionesComunes,
    minDate: "today",
    disable: [(fecha) => nochesOcupadas.has(fechaISO(fecha))],
    onChange: ajustarSalida
  });

  calendarioSalida = flatpickr(inputSalida, {
    ...opcionesComunes,
    minDate: sumarDias(hoyISO(), 1)
  });
} else if (inputEntrada && inputSalida) {
  // por si no carga flatpickr
  inputEntrada.min = hoyISO();
  inputSalida.min  = hoyISO();
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