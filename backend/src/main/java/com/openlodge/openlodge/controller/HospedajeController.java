package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.CambioEstadoHospedajeRequest;
import com.openlodge.openlodge.dto.HospedajeDto;
import com.openlodge.openlodge.dto.PublicarHospedajeRequest;
import com.openlodge.openlodge.service.HospedajeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hospedajes")
public class HospedajeController {

    private final HospedajeService service;

    public HospedajeController(HospedajeService service) {
        this.service = service;
    }

    // las fechas son opcionales: si vienen, solo devuelve los libres en esas fechas
    @GetMapping
    public List<HospedajeDto> listar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate entrada,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate salida) {
        return service.listar(entrada, salida);
    }

    @GetMapping("/anfitrion/{anfitrionId}")
    public List<HospedajeDto> listarPorAnfitrion(@PathVariable Long anfitrionId) {
        return service.listarPorAnfitrion(anfitrionId);
    }

    @GetMapping("/{id}")
    public HospedajeDto obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Hospedaje no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HospedajeDto publicar(@Valid @RequestBody PublicarHospedajeRequest request) {
        return service.publicar(request);
    }

    @PutMapping("/{id}")
    public HospedajeDto editar(@PathVariable Long id, @Valid @RequestBody PublicarHospedajeRequest request) {
        return service.editar(id, request);
    }

    @PostMapping("/{id}/estado")
    public HospedajeDto cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambioEstadoHospedajeRequest request) {
        return service.cambiarEstado(id, request.anfitrionId(), request.activo());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @RequestParam Long anfitrionId) {
        service.eliminar(id, anfitrionId);
    }
}