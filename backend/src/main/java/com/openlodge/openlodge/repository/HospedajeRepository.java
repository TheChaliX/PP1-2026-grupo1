package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HospedajeRepository extends JpaRepository<Hospedaje, Long> {

    List<Hospedaje> findByAnfitrionIdOrderByNombreAsc(Long anfitrionId);

    // para el catalogo
    List<Hospedaje> findByActivoTrue();
}