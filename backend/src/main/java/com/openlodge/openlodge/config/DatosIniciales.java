package com.openlodge.openlodge.config;

import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.Pais;
import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.model.TipoHospedaje;
import com.openlodge.openlodge.repository.CiudadRepository;
import com.openlodge.openlodge.repository.PaisRepository;
import com.openlodge.openlodge.repository.ServicioRepository;
import com.openlodge.openlodge.repository.TipoHospedajeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatosIniciales implements CommandLineRunner {

    private final PaisRepository paisRepository;
    private final CiudadRepository ciudadRepository;
    private final TipoHospedajeRepository tipoHospedajeRepository;
    private final ServicioRepository servicioRepository;

    public DatosIniciales(PaisRepository paisRepository,
                          CiudadRepository ciudadRepository,
                          TipoHospedajeRepository tipoHospedajeRepository,
                          ServicioRepository servicioRepository) {
        this.paisRepository = paisRepository;
        this.ciudadRepository = ciudadRepository;
        this.tipoHospedajeRepository = tipoHospedajeRepository;
        this.servicioRepository = servicioRepository;
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
    }
}