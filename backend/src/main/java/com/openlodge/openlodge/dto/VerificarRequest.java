package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.NotBlank;

public record VerificarRequest(
        @NotBlank(message = "Falta el código de confirmación") String token
) {
}
