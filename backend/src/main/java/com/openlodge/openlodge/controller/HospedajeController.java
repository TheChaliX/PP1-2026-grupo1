package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hospedajes")
public class HospedajeController {

    @GetMapping
    public List<Hospedaje> listar() {
        return List.of(
                new Hospedaje(1L, "Cabaña del Lago", "Cabaña frente al lago con parrilla", "Bariloche", 45000.0, 4),
                new Hospedaje(2L, "Departamento Centro", "Departamento céntrico a dos cuadras de la peatonal", "Santa Fe", 28000.0, 2),
                new Hospedaje(3L, "Casa de Montaña", "Casa con vista a las sierras y chimenea", "Córdoba", 38000.0, 6)
        );
    }
}