package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.dto.LoginRequest;
import com.openlodge.openlodge.dto.RecuperarRequest;
import com.openlodge.openlodge.dto.RegistroRequest;
import com.openlodge.openlodge.dto.RestablecerRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.dto.VerificarRequest;
import com.openlodge.openlodge.service.AutenticacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

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

    // confirma el correo con el token del link
    @PostMapping("/verificar")
    public Map<String, String> verificar(@Valid @RequestBody VerificarRequest request) {
        service.verificarEmail(request);
        return Map.of("mensaje", "Correo confirmado");
    }

    @PostMapping("/reenviar-confirmacion")
    public Map<String, String> reenviarConfirmacion(@Valid @RequestBody RecuperarRequest request) {
        service.reenviarConfirmacion(request);
        return Map.of("mensaje", "Si la cuenta falta confirmar, te enviamos un correo nuevo");
    }

    @PostMapping("/login")
    public UsuarioDto login(@Valid @RequestBody LoginRequest request) {
        return service.login(request);
    }

    // recuperar contraseña: manda el codigo por mail
    @PostMapping("/recuperar")
    public Map<String, String> recuperar(@Valid @RequestBody RecuperarRequest request) {
        service.enviarCodigoRecuperacion(request);
        return Map.of("mensaje", "Si la cuenta existe, te enviamos un código por correo");
    }

    @PostMapping("/restablecer")
    public Map<String, String> restablecer(@Valid @RequestBody RestablecerRequest request) {
        service.restablecerPassword(request);
        return Map.of("mensaje", "Contraseña actualizada");
    }
}