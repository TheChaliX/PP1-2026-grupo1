package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CrearReservaRequest(
        @NotNull(message = "El alojamiento es obligatorio") Long hospedajeId,
        @NotNull(message = "El usuario es obligatorio") Long usuarioId,
        @NotNull(message = "La fecha de entrada es obligatoria") LocalDate fechaCheckIn,
        @NotNull(message = "La fecha de salida es obligatoria") LocalDate fechaCheckOut,

        @NotNull(message = "La cantidad de adultos es obligatoria")
        @Min(value = 1, message = "Tiene que haber al menos 1 adulto") Integer adultos,

        @NotNull(message = "La cantidad de niños es obligatoria")
        @Min(value = 0, message = "La cantidad de niños no puede ser negativa") Integer ninos,

        @NotNull(message = "La cantidad de bebés es obligatoria")
        @Min(value = 0, message = "La cantidad de bebés no puede ser negativa") Integer bebes,

        @NotNull(message = "La cantidad de mascotas es obligatoria")
        @Min(value = 0, message = "La cantidad de mascotas no puede ser negativa")
        @Max(value = 5, message = "Se pueden llevar hasta 5 mascotas") Integer mascotas
) {
    // adultos, niños y bebés cuentan para la capacidad; las mascotas no
    public int totalHuespedes() {
        return adultos + ninos + bebes;
    }
}
