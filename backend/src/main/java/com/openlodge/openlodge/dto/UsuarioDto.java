package com.openlodge.openlodge.dto;

import com.openlodge.openlodge.model.Usuario;

public record UsuarioDto(
        Long id,
        String username,
        String nombre,
        String apellido,
        String email,
        String rol
) {
    public static UsuarioDto desde(Usuario u) {
        return new UsuarioDto(
                u.getId(),
                u.getUsername(),
                u.getNombre(),
                u.getApellido(),
                u.getEmail(),
                u.getTipoUsuario().getNombre()
        );
    }
}