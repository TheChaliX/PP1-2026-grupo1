package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CancelarPorAnfitrionRequest(
        @NotNull(message = "El anfitrión es obligatorio") Long anfitrionId,

        @NotBlank(message = "Escribí el motivo de la cancelación")
        @Size(max = 500, message = "El motivo puede tener hasta 500 caracteres")
        String motivo
) {
}
