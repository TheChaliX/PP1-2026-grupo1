// 1. Referencias al DOM
const tabs = document.querySelectorAll(".tabs a");
const reservas = document.querySelectorAll(".reserva");
const botonesModificar = document.querySelectorAll(".acciones button:nth-child(2)");
const botonesCancelar = document.querySelectorAll(".acciones button:nth-child(3)");

// 2. Funciones

function filtrarReservas(filtro) {
reservas.forEach(function (reserva) {
    if (filtro === "todas" || reserva.classList.contains(filtro)) {
    reserva.style.display = "block";
    } else {
    reserva.style.display = "none";
    }
});
}

function modificarReserva(idReserva) {
window.location.href = "detalle.html?id=" + idReserva;
}

function cancelarReserva(reserva) {
const confirmar = confirm("¿Seguro que querés cancelar esta reserva?");

if (confirmar) {
    reserva.classList.remove("confirmado", "pendiente");
    reserva.classList.add("cancelado");

    const span = reserva.querySelector(".estado");
    span.classList.remove("confirmado", "pendiente");
    span.classList.add("cancelado");
    span.textContent = "Cancelado";
}
}

// 3. Listeners

tabs.forEach(function (tab) {
tab.addEventListener("click", function (evento) {
    evento.preventDefault();

    tabs.forEach(function (t) {
    t.classList.remove("activo");
    });

    tab.classList.add("activo");

    const filtro = tab.dataset.filtro;
    filtrarReservas(filtro);
});
});

botonesModificar.forEach(function (boton) {
boton.addEventListener("click", function () {
    const reserva = boton.closest(".reserva");
    const idReserva = reserva.dataset.id;
    modificarReserva(idReserva);
});
});

botonesCancelar.forEach(function (boton) {
boton.addEventListener("click", function () {
    const reserva = boton.closest(".reserva");
    cancelarReserva(reserva);
});
});