package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.LoginRequest;
import com.openlodge.openlodge.dto.RecuperarRequest;
import com.openlodge.openlodge.dto.RegistroRequest;
import com.openlodge.openlodge.dto.RestablecerRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.dto.VerificarRequest;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AutenticacionService {

    // Roles que se pueden elegir al registrarse
    private static final List<String> ROLES_PERMITIDOS = List.of("huesped", "anfitrion");

    // codigos para recuperar la contraseña, se guardan en memoria y vencen a los 10 min
    private static final long MINUTOS_VALIDEZ_CODIGO = 10;
    private record CodigoRecuperacion(String codigo, Instant vence) {}
    private final Map<String, CodigoRecuperacion> codigos = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    // el link del correo de confirmacion vence a las 24 hs
    private static final long HORAS_VALIDEZ_VERIFICACION = 24;

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;

    public AutenticacionService(UsuarioRepository usuarioRepository,
                       TipoUsuarioRepository tipoUsuarioRepository,
                       PasswordEncoder passwordEncoder,
                       CorreoService correoService) {
        this.usuarioRepository = usuarioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
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

        // la cuenta queda sin confirmar hasta que abra el link del correo
        usuario.setEmailVerificado(false);
        asignarTokenVerificacion(usuario);

        Usuario guardado = usuarioRepository.save(usuario);
        correoService.enviarConfirmacionCuenta(guardado.getEmail(), guardado.getNombre(), guardado.getTokenVerificacion());
        return UsuarioDto.desde(guardado);
    }

    @Transactional(readOnly = true)
    public UsuarioDto login(LoginRequest req) {
        // Mismo mensaje si falla el correo o la contraseña, para no dar pistas
        Usuario usuario = usuarioRepository.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        // se chequea despues de la contraseña para no confirmar a cualquiera que un correo existe
        if (!usuario.isEmailVerificado()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Tenés que confirmar tu correo antes de ingresar. Revisá tu bandeja de entrada (y el spam)");
        }
        return UsuarioDto.desde(usuario);
    }

    // confirma el correo con el token que llego por mail
    @Transactional
    public void verificarEmail(VerificarRequest req) {
        Usuario usuario = usuarioRepository.findByTokenVerificacion(req.token().trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "El link no es válido o ya fue usado"));
        if (usuario.getTokenVerificacionVence() == null
                || LocalDateTime.now().isAfter(usuario.getTokenVerificacionVence())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El link venció. Pedí uno nuevo");
        }
        usuario.setEmailVerificado(true);
        usuario.setTokenVerificacion(null);       // se usa una sola vez
        usuario.setTokenVerificacionVence(null);
        usuarioRepository.save(usuario);
    }

    // genera otro token y manda el correo de nuevo. No avisa si el correo no existe o ya estaba confirmado
    @Transactional
    public void reenviarConfirmacion(RecuperarRequest req) {
        usuarioRepository.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> !u.isEmailVerificado())
                .ifPresent(u -> {
                    asignarTokenVerificacion(u);
                    usuarioRepository.save(u);
                    correoService.enviarConfirmacionCuenta(u.getEmail(), u.getNombre(), u.getTokenVerificacion());
                });
    }

    private void asignarTokenVerificacion(Usuario usuario) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        usuario.setTokenVerificacion(Base64.getUrlEncoder().withoutPadding().encodeToString(bytes));
        usuario.setTokenVerificacionVence(LocalDateTime.now().plusHours(HORAS_VALIDEZ_VERIFICACION));
    }

    // genera un codigo de 6 numeros y lo manda por mail.
    // No avisa si el correo no existe, para no dar pistas de quien tiene cuenta
    @Transactional(readOnly = true)
    public void enviarCodigoRecuperacion(RecuperarRequest req) {
        String email = req.email().trim().toLowerCase();
        if (!usuarioRepository.existsByEmail(email)) {
            return;
        }
        String codigo = String.format("%06d", random.nextInt(1_000_000));
        codigos.put(email, new CodigoRecuperacion(codigo,
                Instant.now().plus(MINUTOS_VALIDEZ_CODIGO, ChronoUnit.MINUTES)));
        correoService.enviarCodigoRecuperacion(email, codigo);
    }

    @Transactional
    public void restablecerPassword(RestablecerRequest req) {
        String email = req.email().trim().toLowerCase();
        CodigoRecuperacion guardado = codigos.get(email);
        if (guardado == null || !guardado.codigo().equals(req.codigo().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código no es correcto");
        }
        if (Instant.now().isAfter(guardado.vence())) {
            codigos.remove(email);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código venció. Pedí uno nuevo");
        }
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe una cuenta con ese correo"));
        usuario.setPassword(passwordEncoder.encode(req.password()));
        usuarioRepository.save(usuario);
        codigos.remove(email); // se usa una sola vez
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