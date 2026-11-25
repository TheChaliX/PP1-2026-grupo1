package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.CrearReservaRequest;
import com.openlodge.openlodge.dto.ReservaDto;
import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Reserva;
import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.BloqueoRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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
 * Prueba la regla de que no se puede reservar en fechas ocupadas.
 * Los repositorios estan simulados con Mockito, no usa la base.
 */
class ReservaServiceTest {

    private ReservaRepository reservaRepository;
    private HospedajeRepository hospedajeRepository;
    private UsuarioRepository usuarioRepository;
    private BloqueoRepository bloqueoRepository;
    private ReservaService service;

    private final LocalDate entrada = LocalDate.now().plusDays(10);
    private final LocalDate salida  = entrada.plusDays(3);

    @BeforeEach
    void preparar() {
        reservaRepository   = mock(ReservaRepository.class);
        hospedajeRepository = mock(HospedajeRepository.class);
        usuarioRepository   = mock(UsuarioRepository.class);
        bloqueoRepository   = mock(BloqueoRepository.class);
        service = new ReservaService(reservaRepository, hospedajeRepository, usuarioRepository,
                bloqueoRepository);

        Usuario huesped = new Usuario();
        huesped.setId(1L);
        huesped.setNombre("Ana");
        huesped.setApellido("Torres");
        huesped.setTipoUsuario(new TipoUsuario(1L, "huesped"));

        Hospedaje hospedaje = new Hospedaje();
        hospedaje.setId(5L);
        hospedaje.setNombre("Cabaña con pileta");
        hospedaje.setCapacidad(4);
        hospedaje.setPrecioPorNoche(new BigDecimal("10000"));
        hospedaje.setCiudad(new Ciudad(1L, "Villa Carlos Paz", null));

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(huesped));
        when(hospedajeRepository.findById(5L)).thenReturn(Optional.of(hospedaje));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void rechazaReservaSiLasFechasSePisanConOtraActiva() {
        when(reservaRepository.hayReservaSuperpuesta(5L, entrada, salida)).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 0, 0, 0)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void rechazaReservaSiElAnfitrionBloqueoEsasFechas() {
        when(reservaRepository.hayReservaSuperpuesta(5L, entrada, salida)).thenReturn(false);
        when(bloqueoRepository.hayBloqueoSuperpuesto(5L, entrada, salida)).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 0, 0, 0)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void guardaReservaYCalculaImporteSiLasFechasEstanLibres() {
        when(reservaRepository.hayReservaSuperpuesta(5L, entrada, salida)).thenReturn(false);

        ReservaDto creada = service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 0, 0, 0));

        // 3 noches x $10.000
        assertEquals(0, new BigDecimal("30000").compareTo(creada.importeTotal()));
        assertEquals("ACTIVA", creada.estado());
    }

    @Test
    void losBebesCuentanParaLaCapacidad() {
        // capacidad 4: 2 adultos + 2 niños + 1 bebé = 5
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 2, 1, 0)));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void rechazaMascotasSiElAlojamientoNoLasPermite() {
        // el alojamiento del setup no tiene el servicio "Mascotas permitidas"
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 0, 0, 1)));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void lasMascotasNoCuentanParaLaCapacidadYSeGuardaElDesglose() {
        when(reservaRepository.hayReservaSuperpuesta(5L, entrada, salida)).thenReturn(false);
        hospedajeRepository.findById(5L).orElseThrow()
                .getServicios().add(new Servicio(1L, "Mascotas permitidas"));

        // capacidad 4: 2 adultos + 1 niño + 1 bebé = 4, más 2 mascotas
        ReservaDto creada = service.crear(new CrearReservaRequest(5L, 1L, entrada, salida, 2, 1, 1, 2));

        assertEquals(4, creada.huespedes());
        assertEquals(2, creada.adultos());
        assertEquals(1, creada.ninos());
        assertEquals(1, creada.bebes());
        assertEquals(2, creada.mascotas());
    }
}
