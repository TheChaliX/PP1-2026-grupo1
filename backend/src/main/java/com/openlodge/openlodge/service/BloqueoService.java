package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.BloqueoDto;
import com.openlodge.openlodge.dto.CrearBloqueoRequest;
import com.openlodge.openlodge.model.Bloqueo;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.repository.BloqueoRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class BloqueoService {

    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    private final BloqueoRepository bloqueoRepository;
    private final HospedajeRepository hospedajeRepository;
    private final ReservaRepository reservaRepository;

    public BloqueoService(BloqueoRepository bloqueoRepository,
                          HospedajeRepository hospedajeRepository,
                          ReservaRepository reservaRepository) {
        this.bloqueoRepository = bloqueoRepository;
        this.hospedajeRepository = hospedajeRepository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public List<BloqueoDto> listar(Long hospedajeId) {
        return bloqueoRepository.findByHospedajeIdOrderByFechaDesdeAsc(hospedajeId).stream()
                .map(BloqueoDto::desde)
                .toList();
    }

    @Transactional
    public BloqueoDto crear(Long hospedajeId, CrearBloqueoRequest req) {
        Hospedaje hospedaje = hospedajeRepository.findById(hospedajeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alojamiento no encontrado"));
        if (!hospedaje.getAnfitrion().getId().equals(req.anfitrionId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este alojamiento no es tuyo");
        }

        LocalDate desde = req.fechaDesde();
        LocalDate hasta = req.fechaHasta();
        if (hasta.isBefore(desde)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha hasta no puede ser anterior a la fecha desde");
        }
        if (desde.isBefore(LocalDate.now(ZONA))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pueden bloquear días pasados");
        }
        // hasta + 1 porque el bloqueo incluye el ultimo dia
        LocalDate diaSiguiente = hasta.plusDays(1);
        if (reservaRepository.hayReservaSuperpuesta(hospedajeId, desde, diaSiguiente)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Hay reservas en esas fechas: no se pueden bloquear");
        }
        if (bloqueoRepository.hayBloqueoSuperpuesto(hospedajeId, desde, diaSiguiente)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Alguno de esos días ya está bloqueado");
        }

        Bloqueo bloqueo = new Bloqueo();
        bloqueo.setHospedaje(hospedaje);
        bloqueo.setFechaDesde(desde);
        bloqueo.setFechaHasta(hasta);
        bloqueo.setMotivo(req.motivo() == null || req.motivo().isBlank() ? null : req.motivo().trim());
        return BloqueoDto.desde(bloqueoRepository.save(bloqueo));
    }

    @Transactional
    public void eliminar(Long bloqueoId, Long anfitrionId) {
        Bloqueo bloqueo = bloqueoRepository.findById(bloqueoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueo no encontrado"));
        if (!bloqueo.getHospedaje().getAnfitrion().getId().equals(anfitrionId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este alojamiento no es tuyo");
        }
        bloqueoRepository.delete(bloqueo);
    }
}
