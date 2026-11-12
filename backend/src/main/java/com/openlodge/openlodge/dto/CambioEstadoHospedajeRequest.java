package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotNull;

public record CambioEstadoHospedajeRequest(
        @NotNull(message = "El anfitrión es obligatorio") Long anfitrionId,
        @NotNull(message = "Indicá si el alojamiento queda activo") Boolean activo
) {
}
