// mis-propiedades.js

const anfitrion         = requerirSesion("anfitrion");
const contenedorPropias = document.getElementById("listaPropiedadesAnfitrion");

let misPropiedades = [];

function crearTarjetaPropiedad(h) {
  const imgHtml = h.imagen
    ? `<img src="${h.imagen}" alt="${h.nombre}">`
    : `<div class="reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  const badge = h.activo
    ? `<span class="badge-estado confirmado">Publicada</span>`
    : `<span class="badge-estado pendiente">Pausada</span>`;

  const botonEstado = h.activo
    ? `<button type="button" class="btn-retirar btn-estado" data-id="${h.id}" data-activo="false"><i class="bi bi-pause-circle"></i> Pausar</button>`
    : `<button type="button" class="btn-editar btn-estado" data-id="${h.id}" data-activo="true"><i class="bi bi-play-circle"></i> Activar</button>`;

  return `
    <article class="propiedad-card ${h.activo ? "" : "propiedad-pausada"}">
      <div class="propiedad-foto">${imgHtml}</div>
      <div class="propiedad-info">
        <div class="propiedad-header">
          <h2>${h.nombre}</h2>
          ${badge}
        </div>
        <p class="propiedad-meta"><i class="bi bi-geo-alt"></i> ${h.ciudad} &nbsp;·&nbsp; <i class="bi bi-currency-dollar"></i> $${Number(h.precioPorNoche).toLocaleString("es-AR")} / noche &nbsp;·&nbsp; <i class="bi bi-people"></i> Hasta ${h.capacidad} huéspedes</p>
        ${h.activo ? "" : `<p class="propiedad-aviso"><i class="bi bi-info-circle"></i> No aparece en el catálogo y no se puede reservar.</p>`}
        <div class="acciones-propiedad">
          <a href="detalle.html?id=${h.id}" class="btn-editar"><i class="bi bi-eye"></i> Ver</a>
          <a href="publicar-alojamiento.html?editar=${h.id}" class="btn-editar"><i class="bi bi-pencil-square"></i> Editar</a>
          <a href="calendario.html?id=${h.id}" class="btn-editar"><i class="bi bi-calendar-x"></i> Bloquear fechas</a>
          ${botonEstado}
          <button type="button" class="btn-retirar btn-eliminar" data-id="${h.id}"><i class="bi bi-trash"></i> Eliminar</button>
        </div>
      </div>
    </article>`;
}

function renderizar() {
  contenedorPropias.innerHTML = misPropiedades.length === 0
    ? `<div class="reservas-vacio"><i class="bi bi-house"></i><p>Todavía no publicaste ningún alojamiento.</p></div>`
    : misPropiedades.map(crearTarjetaPropiedad).join("");
}

// pausar / activar
async function cambiarEstado(id, activo) {
  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/${id}/estado`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anfitrionId: anfitrion.id, activo })
    });
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      mostrarModal(datos.mensaje || "No se pudo cambiar el estado.", "error");
      return;
    }
    misPropiedades = misPropiedades.map((h) => (h.id === datos.id ? datos : h));
    renderizar();
    mostrarModal(activo
      ? "¡Alojamiento activado! Ya aparece en el catálogo."
      : "Alojamiento pausado. No aparece en el catálogo hasta que lo actives.", "exito");
  } catch (error) {
    console.error("Error al cambiar el estado:", error);
    mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
  }
}

// eliminar
async function eliminarPropiedad(id) {
  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/${id}?anfitrionId=${anfitrion.id}`, {
      method: "DELETE"
    });
    if (!respuesta.ok) {
      const datos = await respuesta.json().catch(() => ({}));
      mostrarModal(datos.mensaje || "No se pudo eliminar el alojamiento.", "error");
      return;
    }
    misPropiedades = misPropiedades.filter((h) => h.id !== id);
    renderizar();
    mostrarModal("Alojamiento eliminado.", "exito");
  } catch (error) {
    console.error("Error al eliminar:", error);
    mostrarModal("No se pudo conectar con el servidor. Intentá de nuevo.", "error");
  }
}

// botones de las tarjetas
contenedorPropias?.addEventListener("click", (e) => {
  const botonEstado = e.target.closest(".btn-estado");
  if (botonEstado) {
    cambiarEstado(Number(botonEstado.dataset.id), botonEstado.dataset.activo === "true");
    return;
  }
  const botonEliminar = e.target.closest(".btn-eliminar");
  if (botonEliminar) {
    const id = Number(botonEliminar.dataset.id);
    const nombre = misPropiedades.find((h) => h.id === id)?.nombre || "este alojamiento";
    confirmarModal(`Vas a eliminar "${nombre}". Esto no se puede deshacer.`, {
      titulo: "¿Eliminar alojamiento?",
      textoConfirmar: "Eliminar"
    }).then((confirmado) => {
      if (confirmado) eliminarPropiedad(id);
    });
  }
});

// carga
async function cargarMisPropiedades() {
  if (!anfitrion || !contenedorPropias) return;

  contenedorPropias.innerHTML = `<p class="mensaje-cargando"><i class="bi bi-arrow-repeat spin"></i> Cargando propiedades...</p>`;

  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/anfitrion/${anfitrion.id}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    misPropiedades = await respuesta.json();
    renderizar();
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
    contenedorPropias.innerHTML = `<p class="mensaje-error"><i class="bi bi-exclamation-triangle"></i> No se pudieron cargar tus propiedades. Verificá que el backend esté corriendo.</p>`;
  }
}

cargarMisPropiedades();
