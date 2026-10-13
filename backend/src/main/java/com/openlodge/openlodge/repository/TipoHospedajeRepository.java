package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.TipoHospedaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TipoHospedajeRepository extends JpaRepository<TipoHospedaje, Long> {

    Optional<TipoHospedaje> findByNombre(String nombre);
}