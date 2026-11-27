package com.openlodge.openlodge.repository;

import com.openlodge.openlodge.model.Bloqueo;
import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.model.EstadoReserva;
import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.model.Reserva;
import com.openlodge.openlodge.model.Servicio;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Filtros del catálogo. Arma UNA sola consulta: cada filtro que llega suma una
 * condición al WHERE, y los que no llegan no se agregan.
 */
public final class HospedajeSpecs {

    private HospedajeSpecs() {
    }

    public static Specification<Hospedaje> catalogo(String destino, BigDecimal precioMin, BigDecimal precioMax,
                                                    List<String> servicios, LocalDate entrada, LocalDate salida) {
        return (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();

            // solo los publicados (un eliminado tambien queda con activo = false)
            condiciones.add(cb.isTrue(root.<Boolean>get("activo")));

            // destino: busca el texto en la ciudad o en el nombre del alojamiento,
            // sin importar mayusculas ni tildes ("cordoba" encuentra "Córdoba")
            if (destino != null) {
                String patron = "%" + sinTildes(destino) + "%";
                Join<Hospedaje, Ciudad> ciudad = root.join("ciudad");
                condiciones.add(cb.or(
                        cb.like(sinTildes(cb, ciudad.<String>get("nombre")), patron),
                        cb.like(sinTildes(cb, root.<String>get("nombre")), patron)));
            }

            if (precioMin != null) {
                condiciones.add(cb.greaterThanOrEqualTo(root.<BigDecimal>get("precioPorNoche"), precioMin));
            }
            if (precioMax != null) {
                condiciones.add(cb.lessThanOrEqualTo(root.<BigDecimal>get("precioPorNoche"), precioMax));
            }

            // extras: tiene que tener TODOS los marcados (un EXISTS por cada uno)
            for (String nombreServicio : servicios) {
                Subquery<Long> tieneServicio = query.subquery(Long.class);
                Root<Hospedaje> h = tieneServicio.from(Hospedaje.class);
                Join<Hospedaje, Servicio> s = h.join("servicios");
                tieneServicio.select(h.<Long>get("id"))
                        .where(cb.equal(h, root), cb.equal(s.<String>get("nombre"), nombreServicio));
                condiciones.add(cb.exists(tieneServicio));
            }

            // fechas: que no haya una reserva confirmada ni un bloqueo que se pise.
            // Es la misma regla que se usa al reservar (cruce 3 del modelo)
            if (entrada != null && salida != null) {
                Subquery<Long> reservas = query.subquery(Long.class);
                Root<Reserva> r = reservas.from(Reserva.class);
                reservas.select(r.<Long>get("id")).where(
                        cb.equal(r.get("hospedaje"), root),
                        cb.equal(r.get("estado"), EstadoReserva.CONFIRMADA),
                        cb.lessThan(r.<LocalDate>get("fechaCheckIn"), salida),
                        cb.greaterThan(r.<LocalDate>get("fechaCheckOut"), entrada));
                condiciones.add(cb.not(cb.exists(reservas)));

                Subquery<Long> bloqueos = query.subquery(Long.class);
                Root<Bloqueo> b = bloqueos.from(Bloqueo.class);
                bloqueos.select(b.<Long>get("id")).where(
                        cb.equal(b.get("hospedaje"), root),
                        cb.lessThan(b.<LocalDate>get("fechaDesde"), salida),
                        cb.greaterThanOrEqualTo(b.<LocalDate>get("fechaHasta"), entrada));
                condiciones.add(cb.not(cb.exists(bloqueos)));
            }

            return cb.and(condiciones.toArray(new Predicate[0]));
        };
    }

    private static final String CON_TILDE = "áéíóúü";
    private static final String SIN_TILDE = "aeiouu";

    // en la base: translate(lower(columna), 'áéíóúü', 'aeiouu')
    private static Expression<String> sinTildes(CriteriaBuilder cb, Expression<String> columna) {
        return cb.function("translate", String.class, cb.lower(columna), cb.literal(CON_TILDE), cb.literal(SIN_TILDE));
    }

    // el texto que escribio el usuario, igual: en minuscula y sin tildes
    private static String sinTildes(String texto) {
        String minuscula = texto.toLowerCase();
        StringBuilder resultado = new StringBuilder(minuscula.length());
        for (char c : minuscula.toCharArray()) {
            int i = CON_TILDE.indexOf(c);
            resultado.append(i >= 0 ? SIN_TILDE.charAt(i) : c);
        }
        return resultado.toString();
    }
}
