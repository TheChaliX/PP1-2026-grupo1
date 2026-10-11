package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.CambioModoRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/{id}/cambiar-modo")
    public UsuarioDto cambiarModo(@PathVariable Long id, @Valid @RequestBody CambioModoRequest request) {
        return service.cambiarModo(id, request.rol());
    }
}