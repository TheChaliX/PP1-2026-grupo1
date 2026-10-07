package com.openlodge.openlodge.service;

import com.openlodge.openlodge.model.Hospedaje;
import com.openlodge.openlodge.repository.HospedajeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HospedajeService {

    private final HospedajeRepository repository;

    public HospedajeService(HospedajeRepository repository) {
        this.repository = repository;
    }

    public List<Hospedaje> listar() {
        return repository.findAll();
    }

    public Optional<Hospedaje> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public Hospedaje crear(Hospedaje hospedaje) {
        return repository.save(hospedaje);
    }
}