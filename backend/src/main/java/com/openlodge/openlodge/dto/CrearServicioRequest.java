package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CrearServicioRequest(
        @NotBlank(message = "Escribí el nombre del servicio")
        @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
        String nombre
) {
}
