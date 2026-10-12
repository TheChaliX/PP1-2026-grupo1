package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotNull;

public record CancelarReservaRequest(
        @NotNull(message = "El usuario es obligatorio") Long usuarioId
) {
}