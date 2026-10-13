package com.openlodge.openlodge.config;

import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.Pais;
import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.model.TipoHospedaje;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.repository.CiudadRepository;
import com.openlodge.openlodge.repository.PaisRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Order(1)
public class DatosIniciales implements CommandLineRunner {

    private static final List<String> TIPOS_HOSPEDAJE = List.of(
            "Casa", "Cabaña", "Departamento", "Chalet",
            "Casa quinta", "Dúplex", "Hotel", "Hostel", "Estancia");

    private static final List<String> SERVICIOS = List.of(
            "Wi-Fi", "Cocina", "Pileta", "Estacionamiento", "Desayuno",
            "Parrilla", "Vista panorámica", "Aire acondicionado", "TV",
            "Calefacción", "Lavandería", "Jacuzzi", "Mascotas permitidas",
            "Apto para niños", "Seguridad 24h", "Gym");

    private static final List<String> TIPOS_USUARIO = List.of("huesped", "anfitrion", "administrador");

    private final PaisRepository paisRepository;
    private final CiudadRepository ciudadRepository;
    private final TipoHospedajeRepository tipoHospedajeRepository;
    private final ServicioRepository servicioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;

    public DatosIniciales(PaisRepository paisRepository,
                          CiudadRepository ciudadRepository,
                          TipoHospedajeRepository tipoHospedajeRepository,
                          ServicioRepository servicioRepository,
                          TipoUsuarioRepository tipoUsuarioRepository) {
        this.paisRepository = paisRepository;
        this.ciudadRepository = ciudadRepository;
        this.tipoHospedajeRepository = tipoHospedajeRepository;
        this.servicioRepository = servicioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
    }

    @Override
    public void run(String... args) {
        if (paisRepository.count() == 0) {
            Pais argentina = paisRepository.save(new Pais(null, "Argentina"));
            List<String> ciudades = List.of(
                    "Córdoba Capital", "Villa Carlos Paz", "Santa Fe", "Rosario",
                    "Bariloche", "Mendoza", "Salta", "Mar del Plata");
            ciudadRepository.saveAll(ciudades.stream()
                    .map(nombre -> new Ciudad(null, nombre, argentina))
                    .toList());
        }

        // Se agregan solo los que todavía no existen
        Set<String> tiposExistentes = tipoHospedajeRepository.findAll().stream()
                .map(TipoHospedaje::getNombre)
                .collect(Collectors.toSet());
        TIPOS_HOSPEDAJE.stream()
                .filter(nombre -> !tiposExistentes.contains(nombre))
                .forEach(nombre -> tipoHospedajeRepository.save(new TipoHospedaje(null, nombre)));

        Set<String> serviciosExistentes = servicioRepository.findAll().stream()
                .map(Servicio::getNombre)
                .collect(Collectors.toSet());
        SERVICIOS.stream()
                .filter(nombre -> !serviciosExistentes.contains(nombre))
                .forEach(nombre -> servicioRepository.save(new Servicio(null, nombre)));

        Set<String> tiposUsuarioExistentes = tipoUsuarioRepository.findAll().stream()
                .map(TipoUsuario::getNombre)
                .collect(Collectors.toSet());
        TIPOS_USUARIO.stream()
                .filter(nombre -> !tiposUsuarioExistentes.contains(nombre))
                .forEach(nombre -> tipoUsuarioRepository.save(new TipoUsuario(null, nombre)));
    }
}