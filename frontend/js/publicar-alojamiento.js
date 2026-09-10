// 1. Referencias al DOM
const formPublicar = document.querySelector("#formPublicar");
const inputNombre = document.querySelector("#nombre");
const inputDescripcion = document.querySelector("#descripcion");
const inputUbicacion = document.querySelector("#ubicacion");
const selectTipo = document.querySelector("#tipo");
const inputPrecio = document.querySelector("#precioNoche");
const inputHuespedes = document.querySelector("#huespedes");
const inputHabitaciones = document.querySelector("#habitaciones");
const inputCamas = document.querySelector("#camas");
const mensajeFormulario = document.querySelector("#mensajeFormulario");

// Array en memoria para simular la base de publicaciones del sistema
let publicaciones = [];

// 2. Event listener del formulario
formPublicar.addEventListener("submit", function (evento) {
  // Previene que la página se refresque (Clase 17)
  evento.preventDefault();

  mensajeFormulario.textContent = "";
  mensajeFormulario.style.color = "red";

  // Captura de valores limpios de espacios
  const nombre = inputNombre.value.trim();
  const descripcion = inputDescripcion.value.trim();
  const ubicacion = inputUbicacion.value.trim();
  const tipo = selectTipo.value;
  const precio = Number(inputPrecio.value);
  const huespedes = Number(inputHuespedes.value);
  const habitaciones = Number(inputHabitaciones.value);
  const camas = Number(inputCamas.value);

  // Captura de checkboxes seleccionados
  const checkboxesServicios = document.querySelectorAll('input[name="servicios"]:checked');
  const serviciosSeleccionados = [];
  checkboxesServicios.forEach((checkbox) => {
    serviciosSeleccionados.push(checkbox.value);
  });

  // Validación de campos obligatorios
  if (!nombre || !descripcion || !ubicacion || !tipo) {
    mensajeFormulario.textContent = "Por favor, completá todos los campos de texto y tipo.";
    return;
  }

  if (precio <= 0 || huespedes <= 0 || habitaciones <= 0 || camas <= 0) {
    mensajeFormulario.textContent = "Los valores numéricos de precio y capacidad deben ser mayores a cero.";
    return;
  }

  // Creación del nuevo objeto alojamiento (Clase 16 / Clase 17)
  const nuevoAlojamiento = {
    id: Date.now(), // Genera un ID único basado en el tiempo
    nombre: nombre,
    descripcion: descripcion,
    ubicacion: ubicacion,
    tipo: tipo,
    precioNoche: precio,
    huespedes: huespedes,
    habitaciones: habitaciones,
    camas: camas,
    servicios: serviciosSeleccionados,
    imagen: "img/img-cordoba.jpg" // Imagen genérica por defecto
  };

  // Agregar el objeto al array global
  publicaciones.push(nuevoAlojamiento);

  // Mensaje de éxito
  mensajeFormulario.style.color = "green";
  mensajeFormulario.textContent = "¡Alojamiento publicado con éxito! Redirigiendo a Mis Reservas...";

  // Resetear el formulario
  formPublicar.reset();

  // Redirección después de publicar
  setTimeout(() => {
    window.location.href = "reservas.html";
  }, 1500);
});