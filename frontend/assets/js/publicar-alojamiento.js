const formPublicar = document.querySelector("#formPublicar");
const inputNombre = document.querySelector("#nombre");
const inputDescripcion = document.querySelector("#descripcion");
const inputUbicacion = document.querySelector("#ubicacion");
const selectTipo = document.querySelector("#tipo");
const inputPrecio = document.querySelector("#precioNoche");
const inputHuespedes = document.querySelector("#huespedes");
const inputHabitaciones = document.querySelector("#habitaciones");
const inputCamas = document.querySelector("#camas");
const inputImagen = document.querySelector('input[type="file"]');
const mensajeFormulario = document.querySelector("#mensajeFormulario");

let publicaciones = JSON.parse(localStorage.getItem("alojamientosPublicados")) || [];

async function guardarAlojamiento(nuevoAlojamiento) {
  publicaciones.push(nuevoAlojamiento);
  localStorage.setItem("alojamientosPublicados", JSON.stringify(publicaciones));
}

// Función para leer la imagen seleccionada en Base64
function leerImagenComoBase64(archivo) {
  return new Promise((resolve) => {
    if (!archivo) {
      resolve("");
      return;
    }
    const lector = new FileReader();
    lector.onload = function (e) {
      resolve(e.target.result);
    };
    lector.readAsDataURL(archivo);
  });
}

if (formPublicar) {
  formPublicar.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    mensajeFormulario.textContent = "";
    mensajeFormulario.style.color = "red";

    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const ubicacion = inputUbicacion.value.trim();
    const tipo = selectTipo.value;
    const precio = Number(inputPrecio.value);
    const huespedes = Number(inputHuespedes.value);
    const habitaciones = Number(inputHabitaciones.value);
    const camas = Number(inputCamas.value);

    const checkboxesServicios = document.querySelectorAll('input[name="servicios"]:checked');
    const serviciosSeleccionados = [];
    checkboxesServicios.forEach((checkbox) => {
      serviciosSeleccionados.push(checkbox.value);
    });

    if (!nombre || !descripcion || !ubicacion || !tipo) {
      mensajeFormulario.textContent = "Por favor, completá todos los campos de texto y el tipo de alojamiento.";
      return;
    }

    if (precio <= 0 || huespedes <= 0 || habitaciones <= 0 || camas <= 0) {
      mensajeFormulario.textContent = "Los valores numéricos de precio y capacidad deben ser mayores a cero.";
      return;
    }

    // Lee el archivo si el usuario subió uno; si no, queda como cadena vacía ""
    const archivoSeleccionado = inputImagen && inputImagen.files.length > 0 ? inputImagen.files[0] : null;
    const imagenFinal = await leerImagenComoBase64(archivoSeleccionado);

    const nuevoAlojamiento = {
      id: "pub-" + Date.now(), 
      titulo: nombre,
      nombre: nombre,
      descripcion: descripcion,
      ubicacion: ubicacion,
      tipo: tipo,
      precioNoche: precio,
      huespedes: huespedes,
      habitaciones: habitaciones,
      camas: camas,
      servicios: serviciosSeleccionados,
      imagen: imagenFinal, // Si no subió foto, almacena ""
      fechas: "Disponibilidad inmediata",
      estado: "confirmado",
      estadoTexto: "Confirmado"
    };

    await guardarAlojamiento(nuevoAlojamiento);

    mensajeFormulario.style.color = "green";
    mensajeFormulario.textContent = "¡Alojamiento publicado y guardado con éxito! Redirigiendo al catálogo...";

    formPublicar.reset();

    setTimeout(() => {
      window.location.href = "catalogo.html";
    }, 1500);
  });
}