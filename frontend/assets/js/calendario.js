// calendario.js — PP1 2026 Grupo 1

// Proteger: solo anfitriones
requerirSesion("anfitrion");

// ── Selección de días ────────────────────────────────────────────────────
let diasSeleccionados = new Set();

const celdas = document.querySelectorAll(".calendario td[class]");

celdas.forEach((celda) => {
  // Solo dias libres o bloqueados son clickeables (no ocupados)
  if (celda.classList.contains("ocupada")) return;

  celda.style.cursor = "pointer";
  celda.addEventListener("click", () => {
    const num = celda.textContent.trim();
    if (!num) return;

    if (diasSeleccionados.has(num)) {
      diasSeleccionados.delete(num);
      celda.classList.remove("seleccionada");
    } else {
      diasSeleccionados.add(num);
      celda.classList.add("seleccionada");
    }
  });
});

// ── Botón Bloquear ────────────────────────────────────────────────────────
document.querySelector(".btn-reserve")?.addEventListener("click", () => {
  if (diasSeleccionados.size === 0) {
    mostrarModal("Seleccioná al menos un día libre en el calendario para bloquearlo.", "error");
    return;
  }

  const motivo = document.querySelector(".formulario-bloqueo textarea")?.value.trim();
  const dias   = [...diasSeleccionados].sort((a, b) => Number(a) - Number(b)).join(", ");

  // Actualizar clases en el DOM
  celdas.forEach((celda) => {
    if (diasSeleccionados.has(celda.textContent.trim()) && celda.classList.contains("libre")) {
      celda.classList.remove("libre", "seleccionada");
      celda.classList.add("bloqueada");
    }
  });

  diasSeleccionados.clear();
  mostrarModal(`Días ${dias} bloqueados correctamente${motivo ? `: ${motivo}` : ""}.`, "exito");
  if (document.querySelector(".formulario-bloqueo textarea")) {
    document.querySelector(".formulario-bloqueo textarea").value = "";
  }
});

// ── Botón Liberar ─────────────────────────────────────────────────────────
document.querySelector(".btn-secundario")?.addEventListener("click", () => {
  if (diasSeleccionados.size === 0) {
    mostrarModal("Seleccioná al menos un día bloqueado para liberarlo.", "error");
    return;
  }

  const dias = [...diasSeleccionados].sort((a, b) => Number(a) - Number(b)).join(", ");

  celdas.forEach((celda) => {
    if (diasSeleccionados.has(celda.textContent.trim()) && celda.classList.contains("bloqueada")) {
      celda.classList.remove("bloqueada", "seleccionada");
      celda.classList.add("libre");
    }
  });

  diasSeleccionados.clear();
  mostrarModal(`Días ${dias} liberados correctamente.`, "exito");
});

// ── Cambio de propiedad (mockup) ─────────────────────────────────────────
document.getElementById("propiedad")?.addEventListener("change", function () {
  diasSeleccionados.clear();
  celdas.forEach((c) => c.classList.remove("seleccionada"));
  mostrarModal(`Vista actualizada: ${this.options[this.selectedIndex].text}`, "exito");
});
