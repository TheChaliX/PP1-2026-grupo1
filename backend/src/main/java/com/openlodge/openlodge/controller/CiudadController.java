package com.openlodge.openlodge.controller;

import com.openlodge.openlodge.model.Ciudad;
import com.openlodge.openlodge.repository.CiudadRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ciudades")
public class CiudadController {

    private final CiudadRepository repository;

    public CiudadController(CiudadRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<String> listar() {
        return repository.findAll().stream()
                .map(Ciudad::getNombre)
                .sorted()
                .toList();
    }
}