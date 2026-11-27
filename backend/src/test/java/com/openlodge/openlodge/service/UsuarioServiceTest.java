package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.ActualizarPerfilRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.model.TipoUsuario;
import com.openlodge.openlodge.model.Usuario;
import com.openlodge.openlodge.repository.TipoUsuarioRepository;
import com.openlodge.openlodge.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Mi perfil y cambiar de modo.
 */
class UsuarioServiceTest {

    private UsuarioRepository usuarioRepository;
    private TipoUsuarioRepository tipoUsuarioRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private UsuarioService service;
    private Usuario usuario;

    @BeforeEach
    void preparar() {
        usuarioRepository     = mock(UsuarioRepository.class);
        tipoUsuarioRepository = mock(TipoUsuarioRepository.class);
        service = new UsuarioService(usuarioRepository, tipoUsuarioRepository, passwordEncoder);

        usuario = new Usuario();
        usuario.setId(1L);
        usuario.setNombre("Ana");
        usuario.setApellido("Torres");
        usuario.setEmail("ana@correo.com");
        usuario.setPassword(passwordEncoder.encode("vieja1234"));
        usuario.setTipoUsuario(new TipoUsuario(1L, "huesped"));

        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void perfilCambiaNombreYApellidoSinTocarLaContrasena() {
        String hashAntes = usuario.getPassword();

        UsuarioDto actualizado = service.actualizarPerfil(1L, new ActualizarPerfilRequest(" Ana María ", "Torres", null, null));

        assertEquals("Ana María", actualizado.nombre());
        assertEquals(hashAntes, usuario.getPassword());
    }

    @Test
    void perfilCambiaLaContrasenaSiLaActualEsCorrecta() {
        service.actualizarPerfil(1L, new ActualizarPerfilRequest("Ana", "Torres", "vieja1234", "nueva1234"));

        assertTrue(passwordEncoder.matches("nueva1234", usuario.getPassword()));
    }

    @Test
    void perfilRechazaLaContrasenaActualIncorrecta() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.actualizarPerfil(1L, new ActualizarPerfilRequest("Ana", "Torres", "otra", "nueva1234")));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void perfilNoDejaRepetirLaMismaContrasena() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.actualizarPerfil(1L, new ActualizarPerfilRequest("Ana", "Torres", "vieja1234", "vieja1234")));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void cambiarModoPasaDeHuespedAAnfitrion() {
        when(tipoUsuarioRepository.findByNombre("anfitrion")).thenReturn(Optional.of(new TipoUsuario(2L, "anfitrion")));

        UsuarioDto actualizado = service.cambiarModo(1L, "anfitrion");

        assertEquals("anfitrion", actualizado.rol());
    }
}
