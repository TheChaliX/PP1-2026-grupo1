package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaisRepository extends JpaRepository<Pais, Long> {

    Optional<Pais> findByNombre(String nombre);
}