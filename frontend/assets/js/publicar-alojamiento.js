// publicar-alojamiento.js

const API_HOSPEDAJES_URL = `${API_BASE}/hospedajes`;
const API_CIUDADES_URL   = `${API_BASE}/ciudades`;

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

// con ?editar=id se usa la misma pantalla para editar
const idEdicion = new URLSearchParams(window.location.search).get("editar");

// utilidades
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

// acepta links o fotos de assets/img
function esUrlValida(url) {
  return /^(https?:\/\/|assets\/img\/)[^\s"'<>]+$/.test(url);
}

// null si esta vacio
function enteroOpcional(input) {
  if (!input || input.value.trim() === "") return null;
  return Number(input.value);
}

function esEnteroPositivo(n) {
  return Number.isInteger(n) && n >= 1;
}

// servicios - todos los cargados + agregar uno nuevo
const listaServiciosPublicar = document.querySelector("#listaServiciosPublicar");
const inputNuevoServicio     = document.querySelector("#nuevoServicio");
const botonAgregarServicio   = document.querySelector("#btnAgregarServicio");
const errNuevoServicio       = document.querySelector("#err-nuevoServicio");

function crearCheckServicio(nombre, marcado = false) {
  const label = document.createElement("label");
  label.className = "servicio-check";
  label.innerHTML = `<input type="checkbox" name="servicios"> <span><i class="bi ${iconoServicio(nombre)}"></i> </span>`;
  const check = label.querySelector("input");
  check.value = nombre;
  check.checked = marcado;
  label.querySelector("span").append(nombre);
  return label;
}

async function cargarServicios() {
  if (!listaServiciosPublicar) return;
  try {
    const respuesta = await fetch(`${API_BASE}/servicios`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const servicios = await respuesta.json();
    listaServiciosPublicar.replaceChildren(...servicios.map((s) => crearCheckServicio(s)));
  } catch (error) {
    console.error("No se pudieron cargar los servicios:", error);
    listaServiciosPublicar.textContent = "No se pudieron cargar los servicios.";
  }
}

async function agregarServicio() {
  errNuevoServicio.textContent = "";
  const nombre = inputNuevoServicio.value.trim();
  if (nombre.length < 2) {
    errNuevoServicio.textContent = "Escribí el nombre del servicio (al menos 2 letras).";
    return;
  }
  if (tieneEtiquetas(nombre)) {
    errNuevoServicio.textContent = "No uses los caracteres < o >.";
    return;
  }

  botonAgregarServicio.disabled = true;
  try {
    const respuesta = await fetch(`${API_BASE}/servicios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre })
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      errNuevoServicio.textContent = datos.mensaje || "No se pudo agregar el servicio.";
      return;
    }
    // lo agregamos ya marcado
    listaServiciosPublicar.appendChild(crearCheckServicio(datos.nombre, true));
    inputNuevoServicio.value = "";
  } catch (error) {
    console.error("Error al agregar el servicio:", error);
    errNuevoServicio.textContent = "No se pudo conectar con el servidor.";
  } finally {
    botonAgregarServicio.disabled = false;
  }
}

botonAgregarServicio?.addEventListener("click", agregarServicio);
// que el enter no mande el formulario
inputNuevoServicio?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    agregarServicio();
  }
});

// fotos - subir desde la computadora + vista previa
const inputArchivos = document.querySelector("#archivosFotos");
const estadoSubida  = document.querySelector("#estadoSubida");
const previewFotos  = document.querySelector("#previewFotos");

function lineasFotos() {
  return textareaFotos.value.split("\n").map((l) => l.trim()).filter((l) => l !== "");
}

function renderizarPreview() {
  if (!previewFotos) return;
  const urls = lineasFotos().filter(esUrlValida);
  previewFotos.replaceChildren(...urls.map((url, i) => {
    const item = document.createElement("div");
    item.className = "preview-item";
    item.innerHTML = `
      <img alt="Foto ${i + 1}">
      ${i === 0 ? `<span class="preview-portada">Portada</span>` : ""}
      <button type="button" class="preview-quitar" aria-label="Quitar foto"><i class="bi bi-x-lg"></i></button>`;
    item.querySelector("img").src = url;
    item.querySelector(".preview-quitar").addEventListener("click", () => {
      textareaFotos.value = lineasFotos().filter((l) => l !== url).join("\n");
      renderizarPreview();
    });
    return item;
  }));
}

// achicamos la foto antes de subirla para que no pese tanto
async function achicarImagen(archivo) {
  try {
    const bitmap = await createImageBitmap(archivo);
    const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width  = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob || archivo;
  } catch {
    return archivo; // si falla la subimos como esta
  }
}

async function subirFoto(archivo) {
  const datos = new FormData();
  const achicada = await achicarImagen(archivo);
  datos.append("archivo", achicada, archivo.name.replace(/\.[^.]+$/, "") + ".jpg");

  const respuesta = await fetch(`${API_BASE}/imagenes`, { method: "POST", body: datos });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.mensaje || "No se pudo subir la foto.");
  return cuerpo.url;
}

inputArchivos?.addEventListener("change", async () => {
  const archivos = [...inputArchivos.files];
  if (archivos.length === 0) return;
  if (botonPublicar) botonPublicar.disabled = true;
  let errores = 0;

  for (let i = 0; i < archivos.length; i++) {
    estadoSubida.textContent = `Subiendo foto ${i + 1} de ${archivos.length}...`;
    try {
      const url = await subirFoto(archivos[i]);
      textareaFotos.value = [...lineasFotos(), url].join("\n");
      renderizarPreview();
    } catch (error) {
      console.error("Error al subir la foto:", error);
      errores++;
    }
  }

  estadoSubida.textContent = errores === 0
    ? `✓ ${archivos.length === 1 ? "Foto subida" : "Fotos subidas"}.`
    : `No se pudieron subir ${errores} de ${archivos.length} fotos. Revisá que sean JPG, PNG o WEBP de hasta 5 MB.`;
  inputArchivos.value = "";
  if (botonPublicar) botonPublicar.disabled = false;
});

textareaFotos?.addEventListener("input", renderizarPreview);

// modo edición - precargar el formulario
async function cargarParaEditar(usuario) {
  document.title = "Editar alojamiento — AlojAR";
  document.querySelector("#tituloPagina").innerHTML = `<i class="bi bi-pencil-square"></i> Editar alojamiento`;
  document.querySelector("#subtituloPagina").textContent = "Cambiá los datos que quieras y guardá";
  if (botonPublicar) botonPublicar.innerHTML = `<i class="bi bi-check2-circle"></i> Guardar cambios`;

  try {
    const respuesta = await fetch(`${API_HOSPEDAJES_URL}/${idEdicion}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const h = await respuesta.json();

    if (h.anfitrionId !== usuario.id) {
      mostrarModal("Este alojamiento no es tuyo.", "error");
      setTimeout(() => { window.location.href = "mis-propiedades.html"; }, 1500);
      return;
    }

    inputNombre.value       = h.nombre || "";
    inputDescripcion.value  = h.descripcion || "";
    inputUbicacion.value    = h.ciudad || "";
    selectTipo.value        = h.tipo || "";
    inputPrecio.value       = h.precioPorNoche ?? "";
    inputHuespedes.value    = h.capacidad ?? "";
    inputHabitaciones.value = h.habitaciones ?? "";
    inputCamas.value        = h.camas ?? "";
    inputBanos.value        = h.banos ?? "";
    formPublicar.querySelectorAll('input[name="servicios"]').forEach((check) => {
      check.checked = (h.servicios || []).includes(check.value);
    });
    textareaFotos.value = (h.imagenes || []).join("\n");
    renderizarPreview();
  } catch (error) {
    console.error("Error al cargar el alojamiento:", error);
    mostrarModal("No se pudo cargar el alojamiento para editar.", "error");
  }
}

// sugerencias de ciudades
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

// envío del formulario
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
      const respuesta = await fetch(idEdicion ? `${API_HOSPEDAJES_URL}/${idEdicion}` : API_HOSPEDAJES_URL, {
        method: idEdicion ? "PUT" : "POST",
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
        mostrarModal(datos.mensaje || (idEdicion ? "No se pudieron guardar los cambios." : "No se pudo publicar el alojamiento."), "error");
        return;
      }

      const creado = await respuesta.json();
      publicado = true;

      if (idEdicion) {
        mostrarModal("¡Cambios guardados! Redirigiendo...", "exito");
        setTimeout(() => { window.location.href = "mis-propiedades.html"; }, 1500);
        return;
      }

      formPublicar.reset();
      renderizarPreview();
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

// primero los servicios, si no no se pueden marcar al editar
async function iniciar() {
  cargarCiudades();
  await cargarServicios();
  const usuario = obtenerUsuarioActivo();
  if (idEdicion && usuario) await cargarParaEditar(usuario);
}

iniciar();