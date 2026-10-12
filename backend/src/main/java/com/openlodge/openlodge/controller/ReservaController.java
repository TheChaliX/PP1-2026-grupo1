package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.CancelarReservaRequest;
import com.openlodge.openlodge.dto.CrearReservaRequest;
import com.openlodge.openlodge.dto.OcupacionDto;
import com.openlodge.openlodge.dto.ReservaDto;
import com.openlodge.openlodge.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService service;

    public ReservaController(ReservaService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaDto crear(@Valid @RequestBody CrearReservaRequest request) {
        return service.crear(request);
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<ReservaDto> listarPorUsuario(@PathVariable Long usuarioId) {
        return service.listarPorUsuario(usuarioId);
    }

    @GetMapping("/hospedaje/{hospedajeId}/ocupacion")
    public List<OcupacionDto> ocupacion(@PathVariable Long hospedajeId) {
        return service.ocupacion(hospedajeId);
    }

    @PostMapping("/{id}/cancelar")
    public ReservaDto cancelar(@PathVariable Long id, @Valid @RequestBody CancelarReservaRequest request) {
        return service.cancelar(id, request.usuarioId());
    }
}