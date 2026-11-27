package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

// JpaSpecificationExecutor: permite buscar con filtros armados en HospedajeSpecs
public interface HospedajeRepository extends JpaRepository<Hospedaje, Long>, JpaSpecificationExecutor<Hospedaje> {

    // mis propiedades: sin los eliminados
    List<Hospedaje> findByAnfitrionIdAndEliminadoFalseOrderByNombreAsc(Long anfitrionId);

    Optional<Hospedaje> findByIdAndEliminadoFalse(Long id);
}