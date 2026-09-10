
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


let publicaciones = [];


formPublicar.addEventListener("submit", function (evento) {
  
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
    mensajeFormulario.textContent = "Por favor, completá todos los campos de texto y tipo.";
    return;
  }

  if (precio <= 0 || huespedes <= 0 || habitaciones <= 0 || camas <= 0) {
    mensajeFormulario.textContent = "Los valores numéricos de precio y capacidad deben ser mayores a cero.";
    return;
  }

  
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
    imagen: "img/img-cordoba.jpg" 
  };

  
  publicaciones.push(nuevoAlojamiento);

  
  mensajeFormulario.style.color = "green";
  mensajeFormulario.textContent = "¡Alojamiento publicado con éxito! Redirigiendo a Mis Reservas...";

  
  formPublicar.reset();

  
  setTimeout(() => {
    window.location.href = "reservas.html";
  }, 1500);
});