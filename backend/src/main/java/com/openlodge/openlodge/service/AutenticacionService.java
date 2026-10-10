package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.LoginRequest;
import com.openlodge.openlodge.dto.RegistroRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AutenticacionService {

    // El administrador no se puede elegir al registrarse
    private static final List<String> ROLES_PERMITIDOS = List.of("huesped", "anfitrion");

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AutenticacionService(UsuarioRepository usuarioRepository,
                       TipoUsuarioRepository tipoUsuarioRepository,
                       PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioDto registrar(RegistroRequest req) {
        String rol = req.rol().trim().toLowerCase();
        if (!ROLES_PERMITIDOS.contains(rol)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol debe ser huesped o anfitrion");
        }

        String email = req.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo");
        }

        String username;
        if (req.username() == null || req.username().isBlank()) {
            username = generarUsername(email);
        } else {
            username = req.username().trim();
            if (usuarioRepository.existsByUsername(username)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese nombre de usuario ya está en uso");
            }
        }

        TipoUsuario tipo = tipoUsuarioRepository.findByNombre(rol)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "No está cargado el tipo de usuario " + rol));

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(passwordEncoder.encode(req.password()));
        usuario.setEmail(email);
        usuario.setNombre(req.nombre().trim());
        usuario.setApellido(req.apellido().trim());
        usuario.setFechaNacimiento(req.fechaNacimiento());
        usuario.setTipoUsuario(tipo);

        return UsuarioDto.desde(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioDto login(LoginRequest req) {
        // Mismo mensaje si falla el correo o la contraseña, para no dar pistas
        Usuario usuario = usuarioRepository.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        return UsuarioDto.desde(usuario);
    }

    // Si no mandan username, se arma con la parte del correo antes de la @
    private String generarUsername(String email) {
        String base = email.substring(0, email.indexOf('@'));
        if (base.length() > 40) {
            base = base.substring(0, 40);
        }
        String username = base;
        int n = 1;
        while (usuarioRepository.existsByUsername(username)) {
            username = base + (++n);
        }
        return username;
    }
}