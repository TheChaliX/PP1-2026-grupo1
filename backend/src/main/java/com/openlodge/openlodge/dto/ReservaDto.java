package com.openlodge.openlodge.dto;

import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Reserva;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public record ReservaDto(
        Long id,
        Long hospedajeId,
        String hospedaje,
        String ciudad,
        String imagen,
        LocalDate fechaCheckIn,
        LocalDate fechaCheckOut,
        int noches,
        int huespedes,
        BigDecimal importeTotal,
        String estado,
        LocalDateTime fechaCreacion
) {
    public static ReservaDto desde(Reserva r) {
        Hospedaje h = r.getHospedaje();
        return new ReservaDto(
                r.getId(),
                h.getId(),
                h.getNombre(),
                h.getCiudad().getNombre(),
                h.getImagen(),
                r.getFechaCheckIn(),
                r.getFechaCheckOut(),
                (int) ChronoUnit.DAYS.between(r.getFechaCheckIn(), r.getFechaCheckOut()),
                r.getCantAdultos() + r.getCantNinos() + r.getCantBebes(),
                r.getImporteTotal(),
                r.getEstado().name(),
                r.getFechaCreacion()
        );
    }
}