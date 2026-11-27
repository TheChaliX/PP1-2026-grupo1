package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.LoginRequest;
import com.openlodge.openlodge.dto.RecuperarRequest;
import com.openlodge.openlodge.dto.RegistroRequest;
import com.openlodge.openlodge.dto.UsuarioDto;
import com.openlodge.openlodge.dto.VerificarRequest;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Acceso: registro, login, confirmación de correo y recuperar contraseña.
 * Los repositorios y el envío de mails son simulados; la contraseña se codifica con BCrypt de verdad.
 */
class AutenticacionServiceTest {

    private UsuarioRepository usuarioRepository;
    private CorreoService correoService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private AutenticacionService service;

    @BeforeEach
    void preparar() {
        usuarioRepository = mock(UsuarioRepository.class);
        correoService     = mock(CorreoService.class);
        TipoUsuarioRepository tipoUsuarioRepository = mock(TipoUsuarioRepository.class);
        service = new AutenticacionService(usuarioRepository, tipoUsuarioRepository, passwordEncoder, correoService);

        when(tipoUsuarioRepository.findByNombre("huesped")).thenReturn(Optional.of(new TipoUsuario(1L, "huesped")));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    private RegistroRequest registro(String email) {
        return new RegistroRequest("Ana", "Torres", email, "secreta123", "huesped", LocalDate.of(2000, 1, 1), "ana");
    }

    private Usuario usuarioGuardado(String password, boolean verificado) {
        Usuario u = new Usuario();
        u.setId(1L);
        u.setNombre("Ana");
        u.setEmail("ana@correo.com");
        u.setPassword(passwordEncoder.encode(password));
        u.setTipoUsuario(new TipoUsuario(1L, "huesped"));
        u.setEmailVerificado(verificado);
        return u;
    }

    @Test
    void registroGuardaLaContrasenaConHashYMandaElCorreoDeConfirmacion() {
        UsuarioDto creado = service.registrar(registro("Ana@Correo.com"));

        assertEquals("ana@correo.com", creado.email());   // el correo se guarda en minúscula
        verify(usuarioRepository).save(any(Usuario.class));
        verify(correoService).enviarConfirmacionCuenta(any(), any(), any());
    }

    @Test
    void registroRechazaUnCorreoQueYaTieneCuenta() {
        when(usuarioRepository.existsByEmail("ana@correo.com")).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.registrar(registro("ana@correo.com")));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    void loginRechazaUnaContrasenaIncorrecta() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuarioGuardado("secreta123", true)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.login(new LoginRequest("ana@correo.com", "otra-clave")));

        assertEquals(HttpStatus.UNAUTHORIZED, error.getStatusCode());
    }

    @Test
    void loginNoDejaEntrarSinConfirmarElCorreo() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuarioGuardado("secreta123", false)));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.login(new LoginRequest("ana@correo.com", "secreta123")));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
    }

    @Test
    void loginCorrectoDevuelveElUsuario() {
        when(usuarioRepository.findByEmail("ana@correo.com")).thenReturn(Optional.of(usuarioGuardado("secreta123", true)));

        UsuarioDto usuario = service.login(new LoginRequest("ana@correo.com", "secreta123"));

        assertEquals("ana@correo.com", usuario.email());
    }

    @Test
    void verificarConfirmaLaCuentaYElLinkSeUsaUnaSolaVez() {
        Usuario usuario = usuarioGuardado("secreta123", false);
        usuario.setTokenVerificacion("abc");
        usuario.setTokenVerificacionVence(LocalDateTime.now().plusHours(1));
        when(usuarioRepository.findByTokenVerificacion("abc")).thenReturn(Optional.of(usuario));

        service.verificarEmail(new VerificarRequest("abc"));

        assertTrue(usuario.isEmailVerificado());
        assertNull(usuario.getTokenVerificacion());
    }

    @Test
    void verificarRechazaUnLinkVencido() {
        Usuario usuario = usuarioGuardado("secreta123", false);
        usuario.setTokenVerificacion("abc");
        usuario.setTokenVerificacionVence(LocalDateTime.now().minusMinutes(1));
        when(usuarioRepository.findByTokenVerificacion("abc")).thenReturn(Optional.of(usuario));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.verificarEmail(new VerificarRequest("abc")));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
        assertFalse(usuario.isEmailVerificado());
    }

    @Test
    void recuperarNoMandaNadaSiElCorreoNoTieneCuenta() {
        when(usuarioRepository.existsByEmail("nadie@correo.com")).thenReturn(false);

        service.enviarCodigoRecuperacion(new RecuperarRequest("nadie@correo.com"));

        verify(correoService, never()).enviarCodigoRecuperacion(anyString(), anyString());
    }

    @Test
    void registroNoGuardaLaContrasenaEnTextoPlano() {
        service.registrar(registro("ana@correo.com"));

        org.mockito.ArgumentCaptor<Usuario> guardado = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(guardado.capture());
        assertNotEquals("secreta123", guardado.getValue().getPassword());
        assertTrue(passwordEncoder.matches("secreta123", guardado.getValue().getPassword()));
    }
}
