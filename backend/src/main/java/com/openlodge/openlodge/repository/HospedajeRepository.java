package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HospedajeRepository extends JpaRepository<Hospedaje, Long> {

    // mis propiedades: sin los eliminados
    List<Hospedaje> findByAnfitrionIdAndEliminadoFalseOrderByNombreAsc(Long anfitrionId);

    // para el catalogo (un eliminado tambien queda con activo = false)
    List<Hospedaje> findByActivoTrue();

    Optional<Hospedaje> findByIdAndEliminadoFalse(Long id);
}