package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.CambiarFechasRequest;
import com.openlodge.openlodge.dto.CrearReservaRequest;
import com.openlodge.openlodge.dto.OcupacionDto;
import com.openlodge.openlodge.dto.ReservaDto;
import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Reserva;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.BloqueoRepository;
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
import java.util.Comparator;
import java.util.stream.Stream;
import java.util.List;

@Service
public class ReservaService {

    private static final int MAX_NOCHES = 30;
    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final ReservaRepository reservaRepository;
    private final HospedajeRepository hospedajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final BloqueoRepository bloqueoRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          HospedajeRepository hospedajeRepository,
                          UsuarioRepository usuarioRepository,
                          BloqueoRepository bloqueoRepository) {
        this.reservaRepository = reservaRepository;
        this.hospedajeRepository = hospedajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.bloqueoRepository = bloqueoRepository;
    }

    @Transactional
    public ReservaDto crear(CrearReservaRequest req) {
        LocalDate entrada = req.fechaCheckIn();
        LocalDate salida = req.fechaCheckOut();
        long noches = validarFechas(entrada, salida);

        Usuario usuario = usuarioRepository.findById(req.usuarioId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!"huesped".equals(usuario.getTipoUsuario().getNombre())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los huéspedes pueden reservar");
        }

        Hospedaje hospedaje = hospedajeRepository.findById(req.hospedajeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alojamiento no encontrado"));
        if (!hospedaje.isActivo()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este alojamiento no está disponible por el momento");
        }
        if (req.huespedes() > hospedaje.getCapacidad()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El alojamiento admite hasta " + hospedaje.getCapacidad() + " huéspedes");
        }

        if (reservaRepository.hayReservaSuperpuesta(hospedaje.getId(), entrada, salida)
                || bloqueoRepository.hayBloqueoSuperpuesto(hospedaje.getId(), entrada, salida)) {
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

    // valida las fechas y devuelve las noches
    private long validarFechas(LocalDate entrada, LocalDate salida) {
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
        return noches;
    }

    private Reserva buscarModificablePorHuesped(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta reserva no te pertenece");
        }
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya está cancelada");
        }
        // hasta el dia antes de entrar
        if (!reserva.getFechaCheckIn().isAfter(LocalDate.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya no se puede modificar: la estadía comenzó o terminó");
        }
        return reserva;
    }

    @Transactional
    public ReservaDto cambiarFechas(Long reservaId, CambiarFechasRequest req) {
        Reserva reserva = buscarModificablePorHuesped(reservaId, req.usuarioId());
        LocalDate entrada = req.fechaCheckIn();
        LocalDate salida = req.fechaCheckOut();
        long noches = validarFechas(entrada, salida);

        Hospedaje hospedaje = reserva.getHospedaje();
        if (reservaRepository.hayOtraReservaSuperpuesta(hospedaje.getId(), reserva.getId(), entrada, salida)
                || bloqueoRepository.hayBloqueoSuperpuesto(hospedaje.getId(), entrada, salida)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El alojamiento no está disponible en esas fechas");
        }

        reserva.setFechaCheckIn(entrada);
        reserva.setFechaCheckOut(salida);
        reserva.setImporteTotal(hospedaje.getPrecioPorNoche().multiply(BigDecimal.valueOf(noches)));
        return ReservaDto.desde(reservaRepository.save(reserva));
    }

    @Transactional(readOnly = true)
    public List<ReservaDto> listarPorUsuario(Long usuarioId) {
        return reservaRepository.findByUsuarioIdOrderByFechaCheckInDesc(usuarioId).stream()
                .map(ReservaDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReservaDto> listarPorAnfitrion(Long anfitrionId) {
        return reservaRepository.findByHospedajeAnfitrionIdOrderByFechaCheckInDesc(anfitrionId).stream()
                .map(ReservaDto::desde)
                .toList();
    }

    // reservas activas + bloqueos
    @Transactional(readOnly = true)
    public List<OcupacionDto> ocupacion(Long hospedajeId) {
        LocalDate hoy = LocalDate.now(ZONA);
        Stream<OcupacionDto> reservas = reservaRepository
                .findByHospedajeIdAndEstadoOrderByFechaCheckInAsc(hospedajeId, EstadoReserva.ACTIVA).stream()
                .map(r -> new OcupacionDto(r.getFechaCheckIn(), r.getFechaCheckOut(), "reserva"));
        // +1 porque el bloqueo incluye el dia hasta
        Stream<OcupacionDto> bloqueos = bloqueoRepository
                .findByHospedajeIdOrderByFechaDesdeAsc(hospedajeId).stream()
                .map(b -> new OcupacionDto(b.getFechaDesde(), b.getFechaHasta().plusDays(1), "bloqueo"));
        return Stream.concat(reservas, bloqueos)
                .filter(o -> !o.fechaCheckOut().isBefore(hoy))
                .sorted(Comparator.comparing(OcupacionDto::fechaCheckIn))
                .toList();
    }

    @Transactional
    public ReservaDto cancelar(Long reservaId, Long usuarioId, String motivo) {
        Reserva reserva = buscarModificablePorHuesped(reservaId, usuarioId);
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setMotivoCancelacion(motivo.trim());
        reserva.setCanceladaPor("HUESPED");
        return ReservaDto.desde(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaDto cancelarComoAnfitrion(Long reservaId, Long anfitrionId, String motivo) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        if (!reserva.getHospedaje().getAnfitrion().getId().equals(anfitrionId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta reserva no es de uno de tus alojamientos");
        }
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya está cancelada");
        }
        if (!reserva.getFechaCheckIn().isAfter(LocalDate.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya no se puede cancelar: la estadía comenzó o terminó");
        }
        reserva.setEstado(EstadoReserva.CANCELADA);
        reserva.setMotivoCancelacion(motivo.trim());
        reserva.setCanceladaPor("ANFITRION");
        return ReservaDto.desde(reservaRepository.save(reserva));
    }
}