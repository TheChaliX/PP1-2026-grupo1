package com.openlodge.openlodge.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hospedaje")
@Getter
@Setter
@NoArgsConstructor
public class Hospedaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioPorNoche;

    @Column(nullable = false)
    private int capacidad;

    // Foto de portada
    @Column(length = 500)
    private String imagen;

    // Galería completa (tabla aparte: hospedaje_imagen)
    @ElementCollection
    @CollectionTable(name = "hospedaje_imagen", joinColumns = @JoinColumn(name = "id_hospedaje"))
    @OrderColumn(name = "orden")
    @Column(name = "url", length = 500)
    private List<String> imagenes = new ArrayList<>();

    // Opcionales
    private Double calificacion;
    private Integer resenas;

    @Column(length = 20)
    private String destacado;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    private LocalDateTime fechaModificacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_ciudad", nullable = false)
    private Ciudad ciudad;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo_hospedaje", nullable = false)
    private TipoHospedaje tipoHospedaje;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_anfitrion", nullable = false)
    private Usuario anfitrion;

    @ManyToMany
    @JoinTable(name = "servicio_hospedaje",
            joinColumns = @JoinColumn(name = "id_hospedaje"),
            inverseJoinColumns = @JoinColumn(name = "id_servicio"))
    private List<Servicio> servicios = new ArrayList<>();
}