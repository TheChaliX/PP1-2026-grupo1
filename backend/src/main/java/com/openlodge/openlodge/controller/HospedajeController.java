package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.service.HospedajeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/hospedajes")
public class HospedajeController {

    private final HospedajeService service;

    public HospedajeController(HospedajeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Hospedaje> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Hospedaje obtener(@PathVariable Long id) {
        return service.buscarPorId(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Hospedaje no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Hospedaje crear(@Valid @RequestBody Hospedaje hospedaje) {
        return service.crear(hospedaje);
    }
}