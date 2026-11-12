package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Historial del huésped (CU009)
    List<Reserva> findByUsuarioIdOrderByFechaCheckInDesc(Long usuarioId);

    // reservas recibidas del anfitrion
    List<Reserva> findByHospedajeAnfitrionIdOrderByFechaCheckInDesc(Long anfitrionId);

    // para ver si se puede eliminar el alojamiento
    boolean existsByHospedajeIdAndEstadoAndFechaCheckOutAfter(Long hospedajeId, EstadoReserva estado, LocalDate fecha);

    void deleteByHospedajeId(Long hospedajeId);

    // Reservas de un alojamiento, por estado
    List<Reserva> findByHospedajeIdAndEstadoOrderByFechaCheckInAsc(Long hospedajeId, EstadoReserva estado);

    // Disponibilidad (CU007): true si ya hay una reserva activa que se pisa con esas fechas
    @Query("""
            select count(r) > 0 from Reserva r
            where r.hospedaje.id = :hospedajeId
              and r.estado = com.openlodge.openlodge.model.EstadoReserva.ACTIVA
              and r.fechaCheckIn < :checkOut
              and r.fechaCheckOut > :checkIn
            """)
    boolean hayReservaSuperpuesta(@Param("hospedajeId") Long hospedajeId,
                                  @Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);

    // igual que la de arriba pero sin contar la reserva que se edita
    @Query("""
            select count(r) > 0 from Reserva r
            where r.hospedaje.id = :hospedajeId
              and r.id <> :reservaId
              and r.estado = com.openlodge.openlodge.model.EstadoReserva.ACTIVA
              and r.fechaCheckIn < :checkOut
              and r.fechaCheckOut > :checkIn
            """)
    boolean hayOtraReservaSuperpuesta(@Param("hospedajeId") Long hospedajeId,
                                      @Param("reservaId") Long reservaId,
                                      @Param("checkIn") LocalDate checkIn,
                                      @Param("checkOut") LocalDate checkOut);
}