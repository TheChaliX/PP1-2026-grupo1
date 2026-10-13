package com.openlodge.openlodge.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record PublicarHospedajeRequest(
        @NotNull(message = "El anfitrión es obligatorio")
        Long anfitrionId,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre es demasiado largo")
        @Pattern(regexp = "^[^<>]*$", message = "El nombre no puede contener los caracteres < o >")
        String nombre,

        @NotBlank(message = "La descripción es obligatoria")
        @Size(max = 2000, message = "La descripción es demasiado larga")
        @Pattern(regexp = "^[^<>]*$", message = "La descripción no puede contener los caracteres < o >")
        String descripcion,

        @NotBlank(message = "La ciudad es obligatoria")
        @Size(max = 100, message = "El nombre de la ciudad es demasiado largo")
        @Pattern(regexp = "^[^<>]*$", message = "La ciudad no puede contener los caracteres < o >")
        String ciudad,

        @NotBlank(message = "El tipo de alojamiento es obligatorio")
        String tipo,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio por noche debe ser mayor a 0")
        @DecimalMax(value = "10000000", message = "El precio por noche es demasiado alto")
        BigDecimal precioPorNoche,

        @NotNull(message = "La capacidad es obligatoria")
        @Min(value = 1, message = "La capacidad mínima es 1")
        Integer capacidad,

        @Min(value = 1, message = "Las habitaciones deben ser al menos 1")
        Integer habitaciones,

        @Min(value = 1, message = "Las camas deben ser al menos 1")
        Integer camas,

        @Min(value = 1, message = "Los baños deben ser al menos 1")
        Integer banos,

        List<String> servicios,

        List<@Size(max = 500, message = "Una de las direcciones de foto es demasiado larga")
        @Pattern(regexp = "^https?://[^\\s\"'<>]+$",
                message = "Cada foto debe ser una dirección válida que empiece con http:// o https://") String> imagenes
) {
}