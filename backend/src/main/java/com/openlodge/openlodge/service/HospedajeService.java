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
import com.openlodge.openlodge.repository.HospedajeSpecs;
import com.openlodge.openlodge.repository.PaisRepository;
import com.openlodge.openlodge.repository.ReservaRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class HospedajeService {

    private static final Logger log = LoggerFactory.getLogger(HospedajeService.class);

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
    public List<HospedajeDto> listar(String destino, BigDecimal precioMin, BigDecimal precioMax,
                                     List<String> servicios, LocalDate entrada, LocalDate salida) {
        // los textos vacios cuentan como "sin filtro"
        String texto = (destino == null || destino.isBlank()) ? null : destino.trim();
        List<String> extras = servicios == null ? List.of()
                : servicios.stream().filter(s -> s != null && !s.isBlank()).map(String::trim).distinct().toList();

        validarFiltros(precioMin, precioMax, entrada, salida);

        List<HospedajeDto> resultado = repository
                .findAll(HospedajeSpecs.catalogo(texto, precioMin, precioMax, extras, entrada, salida), Sort.by("id"))
                .stream()
                .map(HospedajeDto::desde)
                .toList();

        // queda en la consola del backend que se busco y cuantos encontro
        log.info("Catálogo · destino={} · precio={} a {} · extras={} · fechas={} a {} → {} alojamientos",
                texto, precioMin, precioMax, extras, entrada, salida, resultado.size());
        return resultado;
    }

    private void validarFiltros(BigDecimal precioMin, BigDecimal precioMax, LocalDate entrada, LocalDate salida) {
        if ((precioMin != null && precioMin.signum() < 0) || (precioMax != null && precioMax.signum() < 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El precio no puede ser negativo");
        }
        if (precioMin != null && precioMax != null && precioMin.compareTo(precioMax) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El precio mínimo no puede ser mayor que el máximo");
        }
        if ((entrada == null) != (salida == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Elegí la fecha de llegada y la de salida");
        }
        if (entrada != null) {
            if (entrada.isBefore(LocalDate.now(ZONA))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La llegada no puede ser antes de hoy");
            }
            if (!salida.isAfter(entrada)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La fecha de salida debe ser posterior a la de llegada");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<HospedajeDto> listarPorAnfitrion(Long anfitrionId) {
        return repository.findByAnfitrionIdAndEliminadoFalseOrderByNombreAsc(anfitrionId).stream()
                .map(HospedajeDto::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<HospedajeDto> buscarPorId(Long id) {
        return repository.findByIdAndEliminadoFalse(id).map(HospedajeDto::desde);
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

    // solo se puede eliminar si no tiene reservas confirmadas a futuro.
    // No se borra de la base: se marca como eliminado y deja de verse,
    // asi las reservas viejas y canceladas siguen en el historial del huesped y del anfitrion
    @Transactional
    public void eliminar(Long id, Long anfitrionId) {
        Hospedaje h = buscarDelAnfitrion(id, anfitrionId);
        LocalDate hoy = LocalDate.now(ZONA);
        if (reservaRepository.existsByHospedajeIdAndEstadoAndFechaCheckOutAfter(id, EstadoReserva.CONFIRMADA, hoy)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Tiene reservas activas. Cancelalas primero o pausá el alojamiento");
        }
        h.setEliminado(true);
        h.setActivo(false);
        repository.save(h);
    }

    private Hospedaje buscarDelAnfitrion(Long id, Long anfitrionId) {
        Hospedaje h = repository.findByIdAndEliminadoFalse(id)
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