package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.Pais;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CiudadRepository extends JpaRepository<Ciudad, Long> {
}