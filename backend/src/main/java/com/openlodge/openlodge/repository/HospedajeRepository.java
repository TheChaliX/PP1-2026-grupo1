package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Hospedaje;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class HospedajeRepository {

    // Orden del constructor: id, nombre, descripcion, ciudad, precioPorNoche, capacidad,
    // imagen, imagenes, servicios, calificacion, resenas, destacado, anfitrion
    private final List<Hospedaje> hospedajes = new ArrayList<>(List.of(
            new Hospedaje(1L, "Casa en las montañas",
                    "Refugio perfecto en las sierras cordobesas. Despertá con el canto de los pájaros y disfrutá de atardeceres únicos desde la galería.",
                    "Córdoba Capital", 45000.0, 4,
                    "assets/img/img-cordoba.jpg",
                    List.of("assets/img/img-cordoba.jpg", "assets/img/cordoba-cocina.jpg", "assets/img/cordoba-comedor.jpg",
                            "assets/img/cordoba-habitacion.jpg", "assets/img/cordoba-living.jpg"),
                    List.of("Wi-Fi", "Estacionamiento", "Parrilla", "Vista panorámica"),
                    4.8, 132, "top", "Martín y Sofía"),

            new Hospedaje(2L, "Cabaña con pileta",
                    "Exclusiva cabaña a minutos del centro, rodeada de verde. Ideal para relajarse en la pileta privada con vistas al lago San Roque.",
                    "Villa Carlos Paz", 70000.0, 6,
                    "assets/img/cabañaconpileta.jpg",
                    List.of("assets/img/cabañaconpileta.jpg", "assets/img/cabaña-baño.jpg", "assets/img/cabaña-comedor.jpg",
                            "assets/img/cabaña-habitacion.jpg", "assets/img/cabaña-living.jpg", "assets/img/cabaña-pileta.jpg",
                            "assets/img/cabañalago.jpg", "assets/img/cocina-pileta.jpg"),
                    List.of("Wi-Fi", "Pileta", "Estacionamiento", "Parrilla"),
                    4.6, 98, "oferta", "Valeria"),

            new Hospedaje(3L, "Casa quinta con pileta",
                    "Amplio parque arbolado, quincho techado y pileta enorme. El lugar definitivo para desconectar el fin de semana en familia.",
                    "Santa Fe", 78000.0, 8,
                    "assets/img/img-santafe.jpg",
                    List.of("assets/img/img-santafe.jpg", "assets/img/santafe-baño.jpg", "assets/img/santafe-cocina.jpg",
                            "assets/img/santafe-habitacion.jpg", "assets/img/santafe-living.jpg", "assets/img/habitacion-pileta.jpg",
                            "assets/img/living-pileta.jpg", "assets/img/comedor-pileta.jpg"),
                    List.of("Wi-Fi", "Pileta", "Cocina", "Estacionamiento"),
                    4.3, 54, null, "Esteban"),

            new Hospedaje(4L, "Departamento con vista al río",
                    "Moderno loft en pleno centro con balcón aterrazado mirando al río Paraná. Cerca de los mejores bares y restaurantes de la ciudad.",
                    "Rosario", 55000.0, 3,
                    "assets/img/departamento.jpg",
                    List.of("assets/img/departamento.jpg", "assets/img/departamento-baño.jpg", "assets/img/departamento-cocina.jpg",
                            "assets/img/departamento-habitacion.jpg", "assets/img/departamento-living.jpg"),
                    List.of("Wi-Fi", "Cocina", "Vista panorámica"),
                    4.1, 27, null, "Lucía"),

            new Hospedaje(5L, "Cabaña frente al lago",
                    "Cálida cabaña patagónica construida en madera y piedra. Bajada directa a la playa del lago Nahuel Huapi y estufa a leña.",
                    "Bariloche", 85000.0, 5,
                    "assets/img/bariloche.jpg",
                    List.of("assets/img/bariloche.jpg"),
                    List.of("Wi-Fi", "Parrilla", "Vista panorámica", "Cocina"),
                    4.9, 201, "top", "Familia Rossi"),

            new Hospedaje(6L, "Chalet en los viñedos",
                    "Rodeado de cepas de Malbec, este chalet ofrece una experiencia vitivinícola completa. Incluye degustación de bienvenida para los huéspedes.",
                    "Mendoza", 65000.0, 4,
                    "assets/img/chalet.jpg",
                    List.of("assets/img/chalet.jpg", "assets/img/chalet-baño.jpg", "assets/img/chalet-comedor.jpg",
                            "assets/img/chalet-habitacion.jpg", "assets/img/chalet-living.jpg"),
                    List.of("Wi-Fi", "Pileta", "Estacionamiento", "Cocina"),
                    4.5, 76, null, "Bodega Los Álamos"),

            new Hospedaje(7L, "Cabaña colonial",
                    "Alojamiento con arquitectura tradicional salteña a metros de las principales peñas folclóricas. Sentí el verdadero espíritu del norte.",
                    "Salta", 50000.0, 2,
                    "assets/img/colonial.jpg",
                    List.of("assets/img/colonial.jpg", "assets/img/colonial-cocina.jpg", "assets/img/colonial-habitacion.jpg",
                            "assets/img/colonial-living.jpg", "assets/img/colonial-patio.jpg"),
                    List.of("Wi-Fi", "Aire acondicionado", "Cocina"),
                    4.2, 39, "oferta", "Doña Rosa"),

            new Hospedaje(8L, "Departamento dúplex playa",
                    "Dúplex luminoso y súper moderno a solo dos cuadras del mar. Balcón terraza equipado para disfrutar las noches de verano al aire libre.",
                    "Mar del Plata", 72000.0, 6,
                    "assets/img/duplex.jpg",
                    List.of("assets/img/duplex.jpg", "assets/img/duplex-baño.jpg", "assets/img/duplex-cocina.jpg",
                            "assets/img/duplex-comedor.jpg", "assets/img/duplex-habitacion.jpg"),
                    List.of("Wi-Fi", "Estacionamiento", "Cocina", "Vista panorámica"),
                    4.4, 88, null, "Gastón")
    ));

    private final AtomicLong secuencia = new AtomicLong(8);

    public List<Hospedaje> findAll() {
        return hospedajes;
    }

    public Optional<Hospedaje> findById(Long id) {
        return hospedajes.stream()
                .filter(h -> h.getId().equals(id))
                .findFirst();
    }

    public Hospedaje save(Hospedaje hospedaje) {
        hospedaje.setId(secuencia.incrementAndGet());
        hospedajes.add(hospedaje);
        return hospedaje;
    }
}