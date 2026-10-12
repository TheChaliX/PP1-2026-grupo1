package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.CrearReservaRequest;
import com.openlodge.openlodge.dto.OcupacionDto;
import com.openlodge.openlodge.dto.ReservaDto;
import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Reserva;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservaService {

    private static final int MAX_NOCHES = 30;
    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final ReservaRepository reservaRepository;
    private final HospedajeRepository hospedajeRepository;
    private final UsuarioRepository usuarioRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          HospedajeRepository hospedajeRepository,
                          UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.hospedajeRepository = hospedajeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ReservaDto crear(CrearReservaRequest req) {
        LocalDate entrada = req.fechaCheckIn();
        LocalDate salida = req.fechaCheckOut();

        if (!salida.isAfter(entrada)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de salida debe ser posterior a la de entrada");
        }
        if (entrada.isBefore(LocalDate.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de entrada no puede ser anterior a hoy");
        }
        long noches = ChronoUnit.DAYS.between(entrada, salida);
        if (noches > MAX_NOCHES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La estadía máxima es de " + MAX_NOCHES + " noches");
        }

        Usuario usuario = usuarioRepository.findById(req.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!"huesped".equals(usuario.getTipoUsuario().getNombre())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los huéspedes pueden reservar");
        }

        Hospedaje hospedaje = hospedajeRepository.findById(req.hospedajeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alojamiento no encontrado"));
        if (req.huespedes() > hospedaje.getCapacidad()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El alojamiento admite hasta " + hospedaje.getCapacidad() + " huéspedes");
        }

        if (reservaRepository.hayReservaSuperpuesta(hospedaje.getId(), entrada, salida)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El alojamiento no está disponible en esas fechas");
        }

        Reserva reserva = new Reserva();
        reserva.setHospedaje(hospedaje);
        reserva.setUsuario(usuario);
        reserva.setFechaCheckIn(entrada);
        reserva.setFechaCheckOut(salida);
        reserva.setCantAdultos(req.huespedes());
        reserva.setCantNinos(0);
        reserva.setCantBebes(0);
        reserva.setCantMascotas(0);
        reserva.setImporteTotal(hospedaje.getPrecioPorNoche().multiply(BigDecimal.valueOf(noches)));
        reserva.setEstado(EstadoReserva.ACTIVA);

        return ReservaDto.desde(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaDto> listarPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioIdOrderByFechaCheckInDesc(usuarioId).stream()
                .map(ReservaDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OcupacionDto> ocupacion(Long hospedajeId) {
        LocalDate hoy = LocalDate.now(ZONA);
        return reservaRepository
                .findByHospedajeIdAndEstadoOrderByFechaCheckInAsc(hospedajeId, EstadoReserva.ACTIVA).stream()
                .filter(r -> !r.getFechaCheckOut().isBefore(hoy))
                .map(r -> new OcupacionDto(r.getFechaCheckIn(), r.getFechaCheckOut()))
                .toList();
    }

    @Transactional
    public ReservaDto cancelar(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta reserva no te pertenece");
        }
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya está cancelada");
        }
        // Plazo: se puede cancelar hasta el día anterior a la entrada
        if (!reserva.getFechaCheckIn().isAfter(LocalDate.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya no se puede cancelar: la estadía comenzó o terminó");
        }

        reserva.setEstado(EstadoReserva.CANCELADA);
        return ReservaDto.desde(reservaRepository.save(reserva));
    }
}