package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotBlank;

public record CambioModoRequest(
        @NotBlank(message = "El rol es obligatorio") String rol
) {
}