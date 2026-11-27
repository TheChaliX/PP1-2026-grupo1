package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.ActualizarPerfilRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private static final List<String> MODOS_PERMITIDOS = List.of("huesped", "anfitrion");

    private final UsuarioRepository usuarioRepository;
    private final TipoUsuarioRepository tipoUsuarioRepository;

    // Los hashes de BCrypt llevan adentro su configuración, así que este codificador
    // puede comparar los que generó el registro. Si el proyecto ya tiene un
    // @Bean PasswordEncoder, conviene inyectarlo por constructor en vez de crear uno acá.
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository usuarioRepository,
                          TipoUsuarioRepository tipoUsuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.tipoUsuarioRepository = tipoUsuarioRepository;
    }

    @Transactional
    public UsuarioDto cambiarModo(Long id, String modo) {
        String nuevoModo = modo.trim().toLowerCase();
        if (!MODOS_PERMITIDOS.contains(nuevoModo)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El modo debe ser huesped o anfitrion");
        }

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Solo las cuentas de huésped o anfitrión pueden alternar (el administrador no)
        if (!MODOS_PERMITIDOS.contains(usuario.getTipoUsuario().getNombre())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta cuenta no puede cambiar de modo");
        }

        TipoUsuario tipo = tipoUsuarioRepository.findByNombre(nuevoModo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "No está cargado el tipo de usuario " + nuevoModo));

        usuario.setTipoUsuario(tipo);
        return UsuarioDto.desde(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioDto actualizarPerfil(Long id, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        String passwordNueva = request.passwordNueva();
        boolean cambiaPassword = passwordNueva != null && !passwordNueva.isEmpty();

        // Primero se valida la contraseña, así no se toca nada si algo falla
        if (cambiaPassword) {
            String passwordActual = request.passwordActual();
            if (passwordActual == null || passwordActual.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ingresá tu contraseña actual");
            }
            if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "La contraseña actual no es correcta");
            }
            usuario.setPassword(passwordEncoder.encode(passwordNueva));
        }

        usuario.setNombre(request.nombre().trim());
        usuario.setApellido(request.apellido().trim());

        // fechaModificacion la actualiza sola @UpdateTimestamp de la entidad
        return UsuarioDto.desde(usuarioRepository.save(usuario));
    }
}