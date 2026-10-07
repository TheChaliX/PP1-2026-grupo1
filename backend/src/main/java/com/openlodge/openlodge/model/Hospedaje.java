package com.openlodge.openlodge.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospedaje {
    private Long id;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @Positive(message = "El precio por noche debe ser mayor a 0")
    private double precioPorNoche;

    @Min(value = 1, message = "La capacidad mínima es 1")
    private int capacidad;
}