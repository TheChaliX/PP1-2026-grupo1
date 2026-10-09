package com.openlodge.openlodge.config;

import org.springframework.core.annotation.Order;
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
import org.springframework.stereotype.Component;

import java.util.List;

@Order(1)
@Component
public class DatosIniciales implements CommandLineRunner {

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

        if (tipoHospedajeRepository.count() == 0) {
            tipoHospedajeRepository.saveAll(List.of("Casa", "Cabaña", "Departamento", "Chalet").stream()
                    .map(nombre -> new TipoHospedaje(null, nombre))
                    .toList());
        }

        if (servicioRepository.count() == 0) {
            servicioRepository.saveAll(List.of(
                            "Wi-Fi", "Cocina", "Pileta", "Estacionamiento", "Desayuno",
                            "Parrilla", "Vista panorámica", "Aire acondicionado", "TV").stream()
                    .map(nombre -> new Servicio(null, nombre))
                    .toList());
        }

        if (tipoUsuarioRepository.count() == 0) {
            tipoUsuarioRepository.saveAll(List.of("huesped", "anfitrion", "administrador").stream()
                    .map(nombre -> new TipoUsuario(null, nombre))
                    .toList());
        }
    }
}