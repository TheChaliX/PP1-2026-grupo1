// publicar-alojamiento.js — PP1 2026 Grupo 1

const API_HOSPEDAJES_URL = "http://localhost:8080/api/hospedajes";
const API_CIUDADES_URL   = "http://localhost:8080/api/ciudades";

const formPublicar       = document.querySelector("#formPublicar");

const inputNombre        = document.querySelector("#nombre");
const inputDescripcion   = document.querySelector("#descripcion");
const inputUbicacion     = document.querySelector("#ubicacion");
const selectTipo         = document.querySelector("#tipo");
const inputPrecio        = document.querySelector("#precioNoche");
const inputHuespedes     = document.querySelector("#huespedes");
const inputHabitaciones  = document.querySelector("#habitaciones");
const inputCamas         = document.querySelector("#camas");
const inputBanos         = document.querySelector("#banos");
const textareaFotos      = document.querySelector("#fotos");
const listaCiudades      = document.querySelector("#listaCiudades");
const botonPublicar      = formPublicar ? formPublicar.querySelector("button[type='submit']") : null;

// ── Utilidades ─────────────────────────────────────────────────────────────
function limpiarErrores() {
  document.querySelectorAll(".campo-error").forEach((el) => {
    el.textContent = "";
  });
  document.querySelectorAll(".input-invalido").forEach((el) => {
    el.classList.remove("input-invalido");
  });
}

function marcarError(input, idError, mensaje) {
  if (input) input.classList.add("input-invalido");
  const errSpan = document.querySelector("#" + idError);
  if (errSpan) errSpan.textContent = mensaje;
}

function tieneEtiquetas(texto) {
  return /[<>]/.test(texto);
}

function esUrlValida(url) {
  return /^https?:\/\/[^\s"'<>]+$/.test(url);
}

// Devuelve null si el campo está vacío, o el número si tiene algo
function enteroOpcional(input) {
  if (!input || input.value.trim() === "") return null;
  return Number(input.value);
}

function esEnteroPositivo(n) {
  return Number.isInteger(n) && n >= 1;
}

// ── Sugerencias de ciudades ────────────────────────────────────────────────
async function cargarCiudades() {
  if (!listaCiudades) return;
  try {
    const respuesta = await fetch(API_CIUDADES_URL);
    if (!respuesta.ok) return;
    const ciudades = await respuesta.json();
    ciudades.forEach((nombre) => {
      const opcion = document.createElement("option");
      opcion.value = nombre;
      listaCiudades.appendChild(opcion);
    });
  } catch (error) {
    console.error("No se pudieron cargar las ciudades:", error);
  }
}

// ── Envío del formulario ───────────────────────────────────────────────────
if (formPublicar) {
  formPublicar.addEventListener("submit", async function (e) {
    e.preventDefault();
    limpiarErrores();

    const usuario = obtenerUsuarioActivo();
    if (!usuario || !usuario.id) {
      mostrarModal("Volvé a iniciar sesión para publicar.", "error");
      return;
    }

    const nombre      = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const ciudad      = inputUbicacion.value.trim();
    const tipo        = selectTipo.value;
    const precio      = Number(inputPrecio.value);
    const capacidad   = Number(inputHuespedes.value);
    const habitaciones = enteroOpcional(inputHabitaciones);
    const camas        = enteroOpcional(inputCamas);
    const banos        = enteroOpcional(inputBanos);

    const servicios = Array.from(
      formPublicar.querySelectorAll('input[name="servicios"]:checked')
    ).map((c) => c.value);

    const imagenes = textareaFotos.value
      .split("\n")
      .map((linea) => linea.trim())
      .filter((linea) => linea !== "");

    let hayError = false;

    if (!nombre) {
      marcarError(inputNombre, "err-nombre", "El nombre es obligatorio.");
      hayError = true;
    } else if (tieneEtiquetas(nombre)) {
      marcarError(inputNombre, "err-nombre", "No uses los caracteres < o >.");
      hayError = true;
    }

    if (!descripcion) {
      marcarError(inputDescripcion, "err-descripcion", "Describí el alojamiento.");
      hayError = true;
    } else if (tieneEtiquetas(descripcion)) {
      marcarError(inputDescripcion, "err-descripcion", "No uses los caracteres < o >.");
      hayError = true;
    }

    if (!ciudad) {
      marcarError(inputUbicacion, "err-ubicacion", "La ciudad es obligatoria.");
      hayError = true;
    } else if (tieneEtiquetas(ciudad)) {
      marcarError(inputUbicacion, "err-ubicacion", "No uses los caracteres < o >.");
      hayError = true;
    }

    if (!tipo) {
      marcarError(selectTipo, "err-tipo", "Seleccioná el tipo de alojamiento.");
      hayError = true;
    }

    if (!inputPrecio.value || !(precio > 0)) {
      marcarError(inputPrecio, "err-precio", "El precio debe ser mayor a 0.");
      hayError = true;
    }

    if (!esEnteroPositivo(capacidad)) {
      marcarError(inputHuespedes, "err-huespedes", "Indicá cuántos huéspedes admite (al menos 1).");
      hayError = true;
    }

    if (habitaciones !== null && !esEnteroPositivo(habitaciones)) {
      marcarError(inputHabitaciones, "err-habitaciones", "Tiene que ser un número de 1 en adelante.");
      hayError = true;
    }
    if (camas !== null && !esEnteroPositivo(camas)) {
      marcarError(inputCamas, "err-camas", "Tiene que ser un número de 1 en adelante.");
      hayError = true;
    }
    if (banos !== null && !esEnteroPositivo(banos)) {
      marcarError(inputBanos, "err-banos", "Tiene que ser un número de 1 en adelante.");
      hayError = true;
    }

    const urlInvalida = imagenes.find((url) => !esUrlValida(url));
    if (urlInvalida) {
      marcarError(textareaFotos, "err-fotos",
        "Cada línea debe ser una dirección que empiece con http:// o https://");
      hayError = true;
    }

    if (hayError) {
      mostrarModal("Hay campos con errores. Corregílos antes de publicar.", "error");
      return;
    }

    if (botonPublicar) botonPublicar.disabled = true;
    let publicado = false;

    try {
      const respuesta = await fetch(API_HOSPEDAJES_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anfitrionId: usuario.id,
          nombre,
          descripcion,
          ciudad,
          tipo,
          precioPorNoche: precio,
          capacidad,
          habitaciones,
          camas,
          banos,
          servicios,
          imagenes
        })
      });

      if (!respuesta.ok) {
        const datos = await respuesta.json().catch(() => ({}));
        mostrarModal(datos.mensaje || "No se pudo publicar el alojamiento.", "error");
        return;
      }

      const creado = await respuesta.json();
      publicado = true;
      formPublicar.reset();
      mostrarModal("¡Alojamiento publicado! Redirigiendo...", "exito");

      setTimeout(() => {
        window.location.href = `detalle.html?id=${creado.id}`;
      }, 1500);
    } catch (error) {
      console.error("Error al publicar:", error);
      mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
    } finally {
      if (!publicado && botonPublicar) botonPublicar.disabled = false;
    }
  });
}

cargarCiudades();