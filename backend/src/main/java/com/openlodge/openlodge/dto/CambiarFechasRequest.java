package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CambiarFechasRequest(
        @NotNull(message = "El usuario es obligatorio") Long usuarioId,
        @NotNull(message = "La fecha de entrada es obligatoria") LocalDate fechaCheckIn,
        @NotNull(message = "La fecha de salida es obligatoria") LocalDate fechaCheckOut
) {
}
