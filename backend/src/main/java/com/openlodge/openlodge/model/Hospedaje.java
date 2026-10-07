package com.openlodge.openlodge.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hospedaje {
    private Long id;
    private String nombre;
    private String descripcion;
    private String ciudad;
    private double precioPorNoche;
    private int capacidad;
}