package com.openlodge.openlodge.dto;

import com.openlodge.openlodge.model.Bloqueo;

import java.time.LocalDate;

public record BloqueoDto(
        Long id,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        String motivo
) {
    public static BloqueoDto desde(Bloqueo b) {
        return new BloqueoDto(b.getId(), b.getFechaDesde(), b.getFechaHasta(), b.getMotivo());
    }
}
