package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Bloqueo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BloqueoRepository extends JpaRepository<Bloqueo, Long> {

    List<Bloqueo> findByHospedajeIdOrderByFechaDesdeAsc(Long hospedajeId);

    void deleteByHospedajeId(Long hospedajeId);

    // true si algun bloqueo se pisa con esas fechas
    @Query("""
            select count(b) > 0 from Bloqueo b
            where b.hospedaje.id = :hospedajeId
              and b.fechaDesde < :checkOut
              and b.fechaHasta >= :checkIn
            """)
    boolean hayBloqueoSuperpuesto(@Param("hospedajeId") Long hospedajeId,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);
}
