// reservas-recibidas.js — PP1 2026 Grupo 1
requerirSesion("anfitrion");

const reservasMock = [
  { id:"r-001", propiedad:"Casa en las montañas", propiedadId:"casa-montanas", huesped:"Juan Pérez",   fechas:"15/07/2026 al 20/07/2026", huespedes:4, estado:"confirmado", estadoTexto:"Confirmada",       solicitud:"Check-in después de las 22:00", imagen:"assets/img/img-cordoba.jpg"      },
  { id:"r-002", propiedad:"Cabaña con pileta",     propiedadId:"cabana-pileta",  huesped:"María Gómez", fechas:"10/08/2026 al 15/08/2026", huespedes:2, estado:"confirmado", estadoTexto:"Confirmada",       solicitud:"Cuna para bebé",               imagen:"assets/img/cabañaconpileta.jpg" },
  { id:"r-003", propiedad:"Casa en las montañas", propiedadId:"casa-montanas", huesped:"Carlos Ruiz",  fechas:"22/09/2026 al 25/09/2026", huespedes:3, estado:"pendiente",  estadoTexto:"Pendiente",        solicitud:"",                             imagen:"assets/img/img-cordoba.jpg"      },
  { id:"r-004", propiedad:"Cabaña con pileta",     propiedadId:"cabana-pileta",  huesped:"Ana Torres",  fechas:"01/10/2026 al 05/10/2026", huespedes:2, estado:"cancelado",  estadoTexto:"Cancelada",        solicitud:"",                             imagen:"assets/img/cabañaconpileta.jpg" }
];

function crearTarjetaRecibida(r) {
  const solicitudHtml = r.solicitud
    ? `<p class="reserva-solicitud"><i class="bi bi-chat-left-text"></i> <em>${r.solicitud}</em></p>` : "";

  const accionesHtml = r.estado === "pendiente"
    ? `<div class="acciones-recibida">
         <button class="btn-confirmar btn-accion" data-id="${r.id}"><i class="bi bi-check-circle"></i> Confirmar</button>
         <button class="btn-rechazar  btn-accion" data-id="${r.id}"><i class="bi bi-x-circle"></i> Rechazar</button>
       </div>`
    : `<div class="acciones-recibida"><span class="badge-estado ${r.estado}">${r.estadoTexto}</span></div>`;

  return `
    <article class="reserva-recibida" data-propiedad-id="${r.propiedadId}" data-estado="${r.estado}" data-id="${r.id}">
      <img src="${r.imagen}" alt="${r.propiedad}" class="reserva-recibida-img">
      <div class="info-reserva">
        <h3><i class="bi bi-geo-alt-fill"></i> ${r.propiedad}</h3>
        <p><strong><i class="bi bi-person"></i> Huésped:</strong> ${r.huesped}</p>
        <p><strong><i class="bi bi-calendar"></i> Fechas:</strong> ${r.fechas}</p>
        <p><strong><i class="bi bi-people"></i> Cantidad:</strong> ${r.huespedes} huésped${r.huespedes !== 1 ? "es" : ""}</p>
        ${solicitudHtml}
        ${accionesHtml}
      </div>
    </article>`;
}

function renderizar(lista) {
  const contenedor = document.getElementById("contenedor-reservas-recibidas");
  if (!contenedor) return;
  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="reservas-vacio"><i class="bi bi-inbox"></i><p>No hay reservas para mostrar.</p></div>`;
    return;
  }
  contenedor.innerHTML = lista.map(crearTarjetaRecibida).join("");

  document.querySelectorAll(".btn-confirmar").forEach((btn) => {
    btn.addEventListener("click", () => {
      const r = reservasMock.find(x => x.id === btn.dataset.id);
      if (!r) return;
      r.estado = "confirmado"; r.estadoTexto = "Confirmada";
      aplicarFiltros();
      mostrarModal("Reserva confirmada correctamente.", "exito");
    });
  });

  document.querySelectorAll(".btn-rechazar").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("¿Seguro que querés rechazar esta reserva?")) return;
      const r = reservasMock.find(x => x.id === btn.dataset.id);
      if (!r) return;
      r.estado = "cancelado"; r.estadoTexto = "Rechazada";
      aplicarFiltros();
      mostrarModal("Reserva rechazada.", "error");
    });
  });
}

function aplicarFiltros() {
  const prop   = document.getElementById("filtro-propiedad")?.value || "todas";
  const estado = document.getElementById("filtro-estado")?.value    || "todos";
  const texto  = document.getElementById("filtro-texto")?.value.toLowerCase().trim() || "";

  const filtradas = reservasMock.filter(r => {
    const okProp   = prop   === "todas"  || r.propiedadId === prop;
    const okEstado = estado === "todos"  || r.estado      === estado;
    const okTexto  = !texto || r.huesped.toLowerCase().includes(texto);
    return okProp && okEstado && okTexto;
  });

  renderizar(filtradas);
}

["filtro-propiedad","filtro-estado","filtro-texto"].forEach(id => {
  document.getElementById(id)?.addEventListener("change", aplicarFiltros);
  document.getElementById(id)?.addEventListener("input",  aplicarFiltros);
});

renderizar(reservasMock);
