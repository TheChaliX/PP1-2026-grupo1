package com.openlodge.openlodge.service;

import com.openlodge.openlodge.model.Servicio;
import com.openlodge.openlodge.repository.ServicioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ServicioService {

    private final ServicioRepository repository;

    public ServicioService(ServicioRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<String> listar() {
        return repository.findAllByOrderByNombreAsc().stream().map(Servicio::getNombre).toList();
    }

    @Transactional
    public String crear(String nombre) {
        String limpio = nombre.trim();
        if (repository.existsByNombreIgnoreCase(limpio)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese servicio ya existe");
        }
        return repository.save(new Servicio(null, limpio)).getNombre();
    }
}
