package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class HospedajeRepository {

    private final List<Hospedaje> hospedajes = new ArrayList<>(List.of(
            new Hospedaje(1L, "Cabaña del Lago", "Cabaña frente al lago con parrilla", "Bariloche", 45000.0, 4),
            new Hospedaje(2L, "Departamento Centro", "Departamento céntrico a dos cuadras de la peatonal", "Santa Fe", 28000.0, 2),
            new Hospedaje(3L, "Casa de Montaña", "Casa con vista a las sierras y chimenea", "Córdoba", 38000.0, 6)
    ));

    private final AtomicLong secuencia = new AtomicLong(3);

    public List<Hospedaje> findAll() {
        return hospedajes;
    }

    public Optional<Hospedaje> findById(Long id) {
        return hospedajes.stream()
                .filter(h -> h.getId().equals(id))
                .findFirst();
    }

    public Hospedaje save(Hospedaje hospedaje) {
        hospedaje.setId(secuencia.incrementAndGet());
        hospedajes.add(hospedaje);
        return hospedaje;
    }
}