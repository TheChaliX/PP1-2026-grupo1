package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Pais;
import com.openlodge.openlodge.model.TipoHospedaje;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoHospedajeRepository extends JpaRepository<TipoHospedaje, Long> {
}