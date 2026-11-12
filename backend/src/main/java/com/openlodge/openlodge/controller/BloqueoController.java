package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.BloqueoDto;
import com.openlodge.openlodge.dto.CrearBloqueoRequest;
import com.openlodge.openlodge.service.BloqueoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BloqueoController {

    private final BloqueoService service;

    public BloqueoController(BloqueoService service) {
        this.service = service;
    }

    @GetMapping("/api/hospedajes/{hospedajeId}/bloqueos")
    public List<BloqueoDto> listar(@PathVariable Long hospedajeId) {
        return service.listar(hospedajeId);
    }

    @PostMapping("/api/hospedajes/{hospedajeId}/bloqueos")
    @ResponseStatus(HttpStatus.CREATED)
    public BloqueoDto crear(@PathVariable Long hospedajeId, @Valid @RequestBody CrearBloqueoRequest request) {
        return service.crear(hospedajeId, request);
    }

    @DeleteMapping("/api/bloqueos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @RequestParam Long anfitrionId) {
        service.eliminar(id, anfitrionId);
    }
}
