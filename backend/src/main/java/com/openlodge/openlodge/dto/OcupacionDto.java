package com.openlodge.openlodge.dto;

import java.time.LocalDate;

// tipo es "reserva" o "bloqueo"
public record OcupacionDto(
        LocalDate fechaCheckIn,
        LocalDate fechaCheckOut,
        String tipo
) {
}
