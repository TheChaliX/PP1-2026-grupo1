// mis-propiedades.js — PP1 2026 Grupo 1
// Lista los alojamientos publicados por el anfitrión (salen de MySQL).

const anfitrion          = requerirSesion("anfitrion");
const contenedorPropias  = document.getElementById("listaPropiedadesAnfitrion");

function crearTarjetaPropiedad(h) {
  const imgHtml = h.imagen
    ? `<img src="${h.imagen}" alt="${h.nombre}">`
    : `<div class="reserva-sin-imagen"><i class="bi bi-image"></i></div>`;

  return `
    <article class="propiedad-card">
      <div class="propiedad-foto">${imgHtml}</div>
      <div class="propiedad-info">
        <div class="propiedad-header">
          <h2>${h.nombre}</h2>
          <span class="badge-estado confirmado">Publicada</span>
        </div>
        <p class="propiedad-meta"><i class="bi bi-geo-alt"></i> ${h.ciudad} &nbsp;·&nbsp; <i class="bi bi-currency-dollar"></i> $${Number(h.precioPorNoche).toLocaleString("es-AR")} / noche &nbsp;·&nbsp; <i class="bi bi-people"></i> Hasta ${h.capacidad} huéspedes</p>
        <div class="acciones-propiedad">
          <a href="detalle.html?id=${h.id}" class="btn-editar"><i class="bi bi-eye"></i> Ver publicación</a>
        </div>
      </div>
    </article>`;
}

async function cargarMisPropiedades() {
  if (!anfitrion || !contenedorPropias) return;

  contenedorPropias.innerHTML = `<p class="mensaje-cargando"><i class="bi bi-arrow-repeat spin"></i> Cargando propiedades...</p>`;

  try {
    const respuesta = await fetch(`${API_BASE}/hospedajes/anfitrion/${anfitrion.id}`);
    if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
    const propiedades = await respuesta.json();

    contenedorPropias.innerHTML = propiedades.length === 0
      ? `<div class="reservas-vacio"><i class="bi bi-house"></i><p>Todavía no publicaste ningún alojamiento.</p></div>`
      : propiedades.map(crearTarjetaPropiedad).join("");
  } catch (error) {
    console.error("Error al cargar las propiedades:", error);
    contenedorPropias.innerHTML = `<p class="mensaje-error"><i class="bi bi-exclamation-triangle"></i> No se pudieron cargar tus propiedades. Verificá que el backend esté corriendo.</p>`;
  }
}

cargarMisPropiedades();
