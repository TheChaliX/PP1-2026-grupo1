package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CrearBloqueoRequest(
        @NotNull(message = "El anfitrión es obligatorio") Long anfitrionId,
        @NotNull(message = "La fecha desde es obligatoria") LocalDate fechaDesde,
        @NotNull(message = "La fecha hasta es obligatoria") LocalDate fechaHasta,
        @Size(max = 255, message = "El motivo puede tener hasta 255 caracteres") String motivo
) {
}
