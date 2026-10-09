package com.openlodge.openlodge.dto;

import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Servicio;

import java.math.BigDecimal;
import java.util.List;

public record HospedajeDto(
        Long id,
        String nombre,
        String descripcion,
        String ciudad,
        String tipo,
        BigDecimal precioPorNoche,
        int capacidad,
        String imagen,
        List<String> imagenes,
        List<String> servicios,
        Double calificacion,
        Integer resenas,
        String destacado,
        String anfitrion
) {
    public static HospedajeDto desde(Hospedaje h) {
        return new HospedajeDto(
                h.getId(),
                h.getNombre(),
                h.getDescripcion(),
                h.getCiudad().getNombre(),
                h.getTipoHospedaje().getNombre(),
                h.getPrecioPorNoche(),
                h.getCapacidad(),
                h.getImagen(),
                List.copyOf(h.getImagenes()),
                h.getServicios().stream().map(Servicio::getNombre).toList(),
                h.getCalificacion(),
                h.getResenas(),
                h.getDestacado(),
                h.getAnfitrion().getNombre() + " " + h.getAnfitrion().getApellido()
        );
    }
}