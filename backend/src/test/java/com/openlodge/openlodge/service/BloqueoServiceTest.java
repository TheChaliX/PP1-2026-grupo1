package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.BloqueoDto;
import com.openlodge.openlodge.dto.CrearBloqueoRequest;
import com.openlodge.openlodge.model.Bloqueo;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.BloqueoRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Bloquear fechas: un día bloqueado es una fila propia (no un boolean del alojamiento)
 * y no se puede bloquear encima de una reserva.
 */
class BloqueoServiceTest {

    private BloqueoRepository bloqueoRepository;
    private ReservaRepository reservaRepository;
    private BloqueoService service;

    private final LocalDate desde = LocalDate.now().plusDays(10);
    private final LocalDate hasta = desde.plusDays(2);

    @BeforeEach
    void preparar() {
        bloqueoRepository = mock(BloqueoRepository.class);
        reservaRepository = mock(ReservaRepository.class);
        HospedajeRepository hospedajeRepository = mock(HospedajeRepository.class);
        service = new BloqueoService(bloqueoRepository, hospedajeRepository, reservaRepository);

        Usuario anfitrion = new Usuario();
        anfitrion.setId(7L);
        Hospedaje hospedaje = new Hospedaje();
        hospedaje.setId(3L);
        hospedaje.setAnfitrion(anfitrion);

        when(hospedajeRepository.findById(3L)).thenReturn(Optional.of(hospedaje));
        when(bloqueoRepository.save(any(Bloqueo.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void bloqueaLasFechasSiEstanLibres() {
        BloqueoDto creado = service.crear(3L, new CrearBloqueoRequest(7L, desde, hasta, " Mantenimiento "));

        verify(bloqueoRepository).save(any(Bloqueo.class));
        assertEquals("Mantenimiento", creado.motivo());
    }

    @Test
    void noBloqueaEncimaDeUnaReserva() {
        // el bloqueo incluye el último día, por eso se consulta hasta el día siguiente
        when(reservaRepository.hayReservaSuperpuesta(3L, desde, hasta.plusDays(1))).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(3L, new CrearBloqueoRequest(7L, desde, hasta, null)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(bloqueoRepository, never()).save(any(Bloqueo.class));
    }

    @Test
    void noBloqueaDiasPasados() {
        LocalDate ayer = LocalDate.now().minusDays(1);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(3L, new CrearBloqueoRequest(7L, ayer, ayer, null)));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void otroAnfitrionNoPuedeBloquear() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(3L, new CrearBloqueoRequest(99L, desde, hasta, null)));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }
}
