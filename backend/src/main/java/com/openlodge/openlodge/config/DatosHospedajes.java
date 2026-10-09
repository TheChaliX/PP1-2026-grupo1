package com.openlodge.openlodge.config;

import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.model.TipoHospedaje;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.CiudadRepository;
import com.openlodge.openlodge.repository.HospedajeRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Order(2)
public class DatosHospedajes implements CommandLineRunner {

    // No es un hash válido: estos usuarios de ejemplo no pueden iniciar sesión
    private static final String SIN_ACCESO = "SIN-ACCESO";

    private final HospedajeRepository hospedajeRepository;
    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final CiudadRepository ciudadRepository;
    private final TipoHospedajeRepository tipoHospedajeRepository;
    private final ServicioRepository servicioRepository;

    private Map<String, Ciudad> ciudades;
    private Map<String, TipoHospedaje> tipos;
    private Map<String, Servicio> servicios;
    private TipoUsuario tipoAnfitrion;

    public DatosHospedajes(HospedajeRepository hospedajeRepository,
                           UsuarioRepository usuarioRepository,
                           TipoUsuarioRepository tipoUsuarioRepository,
                           CiudadRepository ciudadRepository,
                           TipoHospedajeRepository tipoHospedajeRepository,
                           ServicioRepository servicioRepository) {
        this.hospedajeRepository = hospedajeRepository;
        this.usuarioRepository = usuarioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.ciudadRepository = ciudadRepository;
        this.tipoHospedajeRepository = tipoHospedajeRepository;
        this.servicioRepository = servicioRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (hospedajeRepository.count() > 0) {
            return;
        }

        ciudades = ciudadRepository.findAll().stream()
                .collect(Collectors.toMap(Ciudad::getNombre, c -> c));
        tipos = tipoHospedajeRepository.findAll().stream()
                .collect(Collectors.toMap(TipoHospedaje::getNombre, t -> t));
        servicios = servicioRepository.findAll().stream()
                .collect(Collectors.toMap(Servicio::getNombre, s -> s));
        tipoAnfitrion = tipoUsuarioRepository.findAll().stream()
                .filter(t -> t.getNombre().equals("anfitrion"))
                .findFirst()
                .orElseThrow();

        guardar("Casa en las montañas",
                "Refugio perfecto en las sierras cordobesas. Despertá con el canto de los pájaros y disfrutá de atardeceres únicos desde la galería.",
                "Córdoba Capital", "Casa", "45000", 4,
                anfitrion("anfitrion1", "Martín y Sofía", "Gómez"),
                fotos("img-cordoba.jpg", "cordoba-cocina.jpg", "cordoba-comedor.jpg",
                        "cordoba-habitacion.jpg", "cordoba-living.jpg"),
                List.of("Wi-Fi", "Estacionamiento", "Parrilla", "Vista panorámica"),
                4.8, 132, "top");

        guardar("Cabaña con pileta",
                "Exclusiva cabaña a minutos del centro, rodeada de verde. Ideal para relajarse en la pileta privada con vistas al lago San Roque.",
                "Villa Carlos Paz", "Cabaña", "70000", 6,
                anfitrion("anfitrion2", "Valeria", "Suárez"),
                fotos("cabañaconpileta.jpg", "cabaña-baño.jpg", "cabaña-comedor.jpg",
                        "cabaña-habitacion.jpg", "cabaña-living.jpg", "cabaña-pileta.jpg",
                        "cabañalago.jpg", "cocina-pileta.jpg"),
                List.of("Wi-Fi", "Pileta", "Estacionamiento", "Parrilla"),
                4.6, 98, "oferta");

        guardar("Casa quinta con pileta",
                "Amplio parque arbolado, quincho techado y pileta enorme. El lugar definitivo para desconectar el fin de semana en familia.",
                "Santa Fe", "Casa", "78000", 8,
                anfitrion("anfitrion3", "Esteban", "Ríos"),
                fotos("img-santafe.jpg", "santafe-baño.jpg", "santafe-cocina.jpg",
                        "santafe-habitacion.jpg", "santafe-living.jpg", "habitacion-pileta.jpg",
                        "living-pileta.jpg", "comedor-pileta.jpg"),
                List.of("Wi-Fi", "Pileta", "Cocina", "Estacionamiento"),
                4.3, 54, null);

        guardar("Departamento con vista al río",
                "Moderno loft en pleno centro con balcón aterrazado mirando al río Paraná. Cerca de los mejores bares y restaurantes de la ciudad.",
                "Rosario", "Departamento", "55000", 3,
                anfitrion("anfitrion4", "Lucía", "Ferrero"),
                fotos("departamento.jpg", "departamento-baño.jpg", "departamento-cocina.jpg",
                        "departamento-habitacion.jpg", "departamento-living.jpg"),
                List.of("Wi-Fi", "Cocina", "Vista panorámica"),
                4.1, 27, null);

        guardar("Cabaña frente al lago",
                "Cálida cabaña patagónica construida en madera y piedra. Bajada directa a la playa del lago Nahuel Huapi y estufa a leña.",
                "Bariloche", "Cabaña", "85000", 5,
                anfitrion("anfitrion5", "Familia", "Rossi"),
                fotos("bariloche.jpg"),
                List.of("Wi-Fi", "Parrilla", "Vista panorámica", "Cocina"),
                4.9, 201, "top");

        guardar("Chalet en los viñedos",
                "Rodeado de cepas de Malbec, este chalet ofrece una experiencia vitivinícola completa. Incluye degustación de bienvenida para los huéspedes.",
                "Mendoza", "Chalet", "65000", 4,
                anfitrion("anfitrion6", "Bodega", "Los Álamos"),
                fotos("chalet.jpg", "chalet-baño.jpg", "chalet-comedor.jpg",
                        "chalet-habitacion.jpg", "chalet-living.jpg"),
                List.of("Wi-Fi", "Pileta", "Estacionamiento", "Cocina"),
                4.5, 76, null);

        guardar("Cabaña colonial",
                "Alojamiento con arquitectura tradicional salteña a metros de las principales peñas folclóricas. Sentí el verdadero espíritu del norte.",
                "Salta", "Cabaña", "50000", 2,
                anfitrion("anfitrion7", "Doña", "Rosa"),
                fotos("colonial.jpg", "colonial-cocina.jpg", "colonial-habitacion.jpg",
                        "colonial-living.jpg", "colonial-patio.jpg"),
                List.of("Wi-Fi", "Aire acondicionado", "Cocina"),
                4.2, 39, "oferta");

        guardar("Departamento dúplex playa",
                "Dúplex luminoso y súper moderno a solo dos cuadras del mar. Balcón terraza equipado para disfrutar las noches de verano al aire libre.",
                "Mar del Plata", "Departamento", "72000", 6,
                anfitrion("anfitrion8", "Gastón", "Molina"),
                fotos("duplex.jpg", "duplex-baño.jpg", "duplex-cocina.jpg",
                        "duplex-comedor.jpg", "duplex-habitacion.jpg"),
                List.of("Wi-Fi", "Estacionamiento", "Cocina", "Vista panorámica"),
                4.4, 88, null);
    }

    private Usuario anfitrion(String username, String nombre, String apellido) {
        Usuario u = new Usuario();
        u.setUsername(username);
        u.setPassword(SIN_ACCESO);
        u.setEmail(username + "@openlodge.demo");
        u.setNombre(nombre);
        u.setApellido(apellido);
        u.setTipoUsuario(tipoAnfitrion);
        return usuarioRepository.save(u);
    }

    private List<String> fotos(String... archivos) {
        List<String> rutas = new ArrayList<>();
        for (String archivo : archivos) {
            rutas.add("assets/img/" + archivo);
        }
        return rutas;
    }

    private void guardar(String nombre, String descripcion, String ciudad, String tipo,
                         String precio, int capacidad, Usuario anfitrion,
                         List<String> imagenes, List<String> nombresServicios,
                         Double calificacion, Integer resenas, String destacado) {
        Hospedaje h = new Hospedaje();
        h.setNombre(nombre);
        h.setDescripcion(descripcion);
        h.setCiudad(ciudades.get(ciudad));
        h.setTipoHospedaje(tipos.get(tipo));
        h.setPrecioPorNoche(new BigDecimal(precio));
        h.setCapacidad(capacidad);
        h.setAnfitrion(anfitrion);
        h.setImagen(imagenes.get(0));
        h.setImagenes(new ArrayList<>(imagenes));
        h.setServicios(nombresServicios.stream().map(servicios::get).collect(Collectors.toCollection(ArrayList::new)));
        h.setCalificacion(calificacion);
        h.setResenas(resenas);
        h.setDestacado(destacado);
        hospedajeRepository.save(h);
    }
}