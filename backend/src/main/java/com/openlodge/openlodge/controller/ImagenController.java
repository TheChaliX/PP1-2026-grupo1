package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.model.Imagen;
import com.openlodge.openlodge.repository.ImagenRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/imagenes")
public class ImagenController {

    private static final List<String> TIPOS_PERMITIDOS = List.of("image/jpeg", "image/png", "image/webp");
    private static final long TAMANIO_MAXIMO = 5 * 1024 * 1024; // 5 MB

    private final ImagenRepository repository;

    public ImagenController(ImagenRepository repository) {
        this.repository = repository;
    }

    // sube la foto y devuelve la url
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> subir(@RequestParam("archivo") MultipartFile archivo) throws IOException {
        if (archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo está vacío");
        }
        if (!TIPOS_PERMITIDOS.contains(archivo.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se aceptan fotos JPG, PNG o WEBP");
        }
        if (archivo.getSize() > TAMANIO_MAXIMO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La foto no puede pesar más de 5 MB");
        }

        Imagen imagen = new Imagen();
        imagen.setContenido(archivo.getBytes());
        imagen.setTipo(archivo.getContentType());
        Long id = repository.save(imagen).getId();

        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/imagenes/{id}").buildAndExpand(id).toUriString();
        return Map.of("url", url);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> ver(@PathVariable Long id) {
        Imagen imagen = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imagen no encontrada"));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getTipo()))
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                .body(imagen.getContenido());
    }
}
