package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.HospedajeDto;
import com.openlodge.openlodge.dto.PublicarHospedajeRequest;
import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Pais;
import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.model.TipoHospedaje;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.BloqueoRepository;
import com.openlodge.openlodge.repository.CiudadRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.PaisRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HospedajeService {

    private final HospedajeRepository repository;
    private final UsuarioRepository usuarioRepository;
    private final TipoHospedajeRepository tipoHospedajeRepository;
    private final ServicioRepository servicioRepository;
    private final CiudadRepository ciudadRepository;
    private final PaisRepository paisRepository;
    private final ReservaRepository reservaRepository;
    private final BloqueoRepository bloqueoRepository;

    private static final ZoneId ZONA = ZoneId.of("America/Argentina/Buenos_Aires");

    public HospedajeService(HospedajeRepository repository,
                            UsuarioRepository usuarioRepository,
                            TipoHospedajeRepository tipoHospedajeRepository,
                            ServicioRepository servicioRepository,
                            CiudadRepository ciudadRepository,
                            PaisRepository paisRepository,
                            ReservaRepository reservaRepository,
                            BloqueoRepository bloqueoRepository) {
        this.repository = repository;
        this.usuarioRepository = usuarioRepository;
        this.tipoHospedajeRepository = tipoHospedajeRepository;
        this.servicioRepository = servicioRepository;
        this.ciudadRepository = ciudadRepository;
        this.paisRepository = paisRepository;
        this.reservaRepository = reservaRepository;
        this.bloqueoRepository = bloqueoRepository;
    }

    @Transactional(readOnly = true)
    public List<HospedajeDto> listar(LocalDate entrada, LocalDate salida) {
        List<Hospedaje> activos = repository.findByActivoTrue();
        if (entrada == null && salida == null) {
            return activos.stream().map(HospedajeDto::desde).toList();
        }
        if (entrada == null || salida == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elegí la fecha de llegada y la de salida");
        }
        if (!salida.isAfter(entrada)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha de salida debe ser posterior a la de llegada");
        }
        // mismas consultas que se usan al reservar
        return activos.stream()
                .filter(h -> !reservaRepository.hayReservaSuperpuesta(h.getId(), entrada, salida)
                        && !bloqueoRepository.hayBloqueoSuperpuesto(h.getId(), entrada, salida))
                .map(HospedajeDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<HospedajeDto> listarPorAnfitrion(Long anfitrionId) {
        return repository.findByAnfitrionIdOrderByNombreAsc(anfitrionId).stream()
                .map(HospedajeDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<HospedajeDto> buscarPorId(Long id) {
        return repository.findById(id).map(HospedajeDto::desde);
    }

    @Transactional
    public HospedajeDto publicar(PublicarHospedajeRequest req) {
        Usuario anfitrion = usuarioRepository.findById(req.anfitrionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (!"anfitrion".equals(anfitrion.getTipoUsuario().getNombre())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo los anfitriones pueden publicar alojamientos");
        }

        Hospedaje h = new Hospedaje();
        h.setAnfitrion(anfitrion);
        aplicarDatos(h, req);
        return HospedajeDto.desde(repository.save(h));
    }

    @Transactional
    public HospedajeDto editar(Long id, PublicarHospedajeRequest req) {
        Hospedaje h = buscarDelAnfitrion(id, req.anfitrionId());
        aplicarDatos(h, req);
        return HospedajeDto.desde(repository.save(h));
    }

    private void aplicarDatos(Hospedaje h, PublicarHospedajeRequest req) {
        TipoHospedaje tipo = tipoHospedajeRepository.findByNombre(req.tipo().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "El tipo de alojamiento no es válido"));

        List<String> nombresServicios = req.servicios() == null
                ? List.of()
                : req.servicios().stream().map(String::trim).distinct().toList();
        List<Servicio> servicios = nombresServicios.isEmpty()
                ? List.of()
                : servicioRepository.findByNombreIn(nombresServicios);
        if (servicios.size() != nombresServicios.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Alguno de los servicios elegidos no es válido");
        }

        List<String> imagenes = req.imagenes() == null
                ? List.of()
                : req.imagenes().stream().map(String::trim).filter(s -> !s.isEmpty()).toList();

        h.setNombre(req.nombre().trim());
        h.setDescripcion(req.descripcion().trim());
        h.setCiudad(obtenerOCrearCiudad(req.ciudad().trim()));
        h.setTipoHospedaje(tipo);
        h.setPrecioPorNoche(req.precioPorNoche());
        h.setCapacidad(req.capacidad());
        h.setHabitaciones(req.habitaciones());
        h.setCamas(req.camas());
        h.setBanos(req.banos());
        h.setServicios(new ArrayList<>(servicios));
        h.setImagen(imagenes.isEmpty() ? null : imagenes.get(0));
        h.setImagenes(new ArrayList<>(imagenes));
    }

    // pausar o activar
    @Transactional
    public HospedajeDto cambiarEstado(Long id, Long anfitrionId, boolean activo) {
        Hospedaje h = buscarDelAnfitrion(id, anfitrionId);
        h.setActivo(activo);
        return HospedajeDto.desde(repository.save(h));
    }

    // solo se puede eliminar si no tiene reservas activas
    @Transactional
    public void eliminar(Long id, Long anfitrionId) {
        Hospedaje h = buscarDelAnfitrion(id, anfitrionId);
        LocalDate hoy = LocalDate.now(ZONA);
        if (reservaRepository.existsByHospedajeIdAndEstadoAndFechaCheckOutAfter(id, EstadoReserva.ACTIVA, hoy)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tiene reservas activas. Cancelalas primero o pausá el alojamiento");
        }
        bloqueoRepository.deleteByHospedajeId(id);
        reservaRepository.deleteByHospedajeId(id);
        repository.delete(h);
    }

    private Hospedaje buscarDelAnfitrion(Long id, Long anfitrionId) {
        Hospedaje h = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alojamiento no encontrado"));
        if (!h.getAnfitrion().getId().equals(anfitrionId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este alojamiento no es tuyo");
        }
        return h;
    }

    // Si la ciudad todavía no existe, se crea dentro de Argentina
    private Ciudad obtenerOCrearCiudad(String nombre) {
        return ciudadRepository.findByNombreIgnoreCase(nombre).orElseGet(() -> {
            Pais argentina = paisRepository.findByNombre("Argentina")
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                            "No está cargado el país Argentina"));
            return ciudadRepository.save(new Ciudad(null, nombre, argentina));
        });
    }
}