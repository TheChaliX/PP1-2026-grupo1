package com.openlodge.openlodge.service;

import com.openlodge.openlodge.dto.HospedajeDto;
import com.openlodge.openlodge.repository.HospedajeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class HospedajeService {

    private final HospedajeRepository repository;

    public HospedajeService(HospedajeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<HospedajeDto> listar() {
        return repository.findAll().stream().map(HospedajeDto::desde).toList();
    }

    @Transactional(readOnly = true)
    public Optional<HospedajeDto> buscarPorId(Long id) {
        return repository.findById(id).map(HospedajeDto::desde);
    }
}