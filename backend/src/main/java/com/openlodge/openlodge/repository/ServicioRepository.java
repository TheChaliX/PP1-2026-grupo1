package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Servicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

    List<Servicio> findByNombreIn(Collection<String> nombres);
}