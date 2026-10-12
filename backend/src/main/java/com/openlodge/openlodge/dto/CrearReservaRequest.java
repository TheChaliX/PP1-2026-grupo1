package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CrearReservaRequest(
        @NotNull(message = "El alojamiento es obligatorio") Long hospedajeId,
        @NotNull(message = "El usuario es obligatorio") Long usuarioId,
        @NotNull(message = "La fecha de entrada es obligatoria") LocalDate fechaCheckIn,
        @NotNull(message = "La fecha de salida es obligatoria") LocalDate fechaCheckOut,
        @NotNull(message = "La cantidad de huéspedes es obligatoria")
        @Min(value = 1, message = "Tiene que haber al menos 1 huésped") Integer huespedes
) {
}