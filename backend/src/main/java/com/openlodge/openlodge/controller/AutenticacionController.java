package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.LoginRequest;
import com.openlodge.openlodge.dto.RegistroRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.service.AutenticacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AutenticacionController {

    private final AutenticacionService service;

    public AutenticacionController(AutenticacionService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioDto registro(@Valid @RequestBody RegistroRequest request) {
        return service.registrar(request);
    }

    @PostMapping("/login")
    public UsuarioDto login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }
}