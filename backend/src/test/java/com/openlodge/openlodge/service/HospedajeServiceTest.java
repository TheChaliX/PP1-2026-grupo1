package com.openlodge.openlodge.service;

import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.BloqueoRepository;
import com.openlodge.openlodge.repository.CiudadRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.PaisRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Regla: eliminar un alojamiento no lo borra de la base. Se marca como eliminado
 * y se saca del catalogo, para no perder el historial de reservas.
 */
class HospedajeServiceTest {

    private HospedajeRepository hospedajeRepository;
    private ReservaRepository reservaRepository;
    private HospedajeService service;
    private Hospedaje hospedaje;

    @BeforeEach
    void preparar() {
        hospedajeRepository = mock(HospedajeRepository.class);
        reservaRepository   = mock(ReservaRepository.class);
        service = new HospedajeService(hospedajeRepository, mock(UsuarioRepository.class),
                mock(TipoHospedajeRepository.class), mock(ServicioRepository.class),
                mock(CiudadRepository.class), mock(PaisRepository.class),
                reservaRepository, mock(BloqueoRepository.class));

        Usuario anfitrion = new Usuario();
        anfitrion.setId(7L);

        hospedaje = new Hospedaje();
        hospedaje.setId(3L);
        hospedaje.setAnfitrion(anfitrion);

        when(hospedajeRepository.findByIdAndEliminadoFalse(3L)).thenReturn(Optional.of(hospedaje));
    }

    @Test
    void eliminarLoMarcaComoEliminadoSinBorrarlo() {
        when(reservaRepository.existsByHospedajeIdAndEstadoAndFechaCheckOutAfter(eq(3L), eq(EstadoReserva.CONFIRMADA), any()))
                .thenReturn(false);

        service.eliminar(3L, 7L);

        assertTrue(hospedaje.isEliminado());
        assertFalse(hospedaje.isActivo());
        verify(hospedajeRepository).save(hospedaje);
        verify(hospedajeRepository, never()).delete(any());
    }

    @Test
    void noDejaEliminarSiTieneReservasConfirmadasAFuturo() {
        when(reservaRepository.existsByHospedajeIdAndEstadoAndFechaCheckOutAfter(eq(3L), eq(EstadoReserva.CONFIRMADA), any()))
                .thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.eliminar(3L, 7L));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertFalse(hospedaje.isEliminado());
    }

    @Test
    void otroAnfitrionNoPuedeEliminarlo() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.eliminar(3L, 99L));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        assertFalse(hospedaje.isEliminado());
    }
}
