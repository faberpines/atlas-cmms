package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.Breaker;
import com.grash.repository.BreakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BreakerService {

    private final BreakerRepository breakerRepository;

    public Breaker create(Breaker breaker) {
        return breakerRepository.save(breaker);
    }

    public Breaker update(Long id, Breaker patch) {
        Breaker existing = breakerRepository.findById(id)
                .orElseThrow(() -> new CustomException("Breaker not found", HttpStatus.NOT_FOUND));
        if (patch.getLabel() != null) existing.setLabel(patch.getLabel());
        if (patch.getCircuitNumber() != null) existing.setCircuitNumber(patch.getCircuitNumber());
        if (patch.getAmperage() != null) existing.setAmperage(patch.getAmperage());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getPanel() != null) existing.setPanel(patch.getPanel());
        return breakerRepository.save(existing);
    }

    public List<Breaker> findByCompany(Long companyId) {
        return breakerRepository.findByCompany_Id(companyId);
    }

    public List<Breaker> findByPanel(Long panelId) {
        return breakerRepository.findByPanel_Id(panelId);
    }

    public Optional<Breaker> findById(Long id) {
        return breakerRepository.findById(id);
    }

    public void delete(Long id) {
        breakerRepository.deleteById(id);
    }
}
