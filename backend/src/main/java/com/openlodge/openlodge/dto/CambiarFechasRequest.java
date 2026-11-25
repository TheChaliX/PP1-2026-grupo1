package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CambiarFechasRequest(
        @NotNull(message = "El usuario es obligatorio") Long usuarioId,
        @NotNull(message = "La fecha de entrada es obligatoria") LocalDate fechaCheckIn,
        @NotNull(message = "La fecha de salida es obligatoria") LocalDate fechaCheckOut,

        @NotBlank(message = "Escribí el motivo del cambio de fechas")
        @Size(max = 500, message = "El motivo puede tener hasta 500 caracteres")
        String motivo
) {
}
