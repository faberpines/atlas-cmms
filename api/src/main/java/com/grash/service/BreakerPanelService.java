package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.BreakerPanel;
import com.grash.repository.BreakerPanelRepository;
import com.grash.repository.BreakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BreakerPanelService {

    private final BreakerPanelRepository breakerPanelRepository;
    private final BreakerRepository breakerRepository;

    public BreakerPanel create(BreakerPanel panel) {
        return breakerPanelRepository.save(panel);
    }

    public BreakerPanel update(Long id, BreakerPanel patch) {
        BreakerPanel existing = breakerPanelRepository.findById(id)
                .orElseThrow(() -> new CustomException("Breaker panel not found", HttpStatus.NOT_FOUND));
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getLocation() != null) existing.setLocation(patch.getLocation());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return breakerPanelRepository.save(existing);
    }

    public List<BreakerPanel> findByCompany(Long companyId) {
        return breakerPanelRepository.findByCompany_Id(companyId);
    }

    public Optional<BreakerPanel> findById(Long id) {
        return breakerPanelRepository.findById(id);
    }

    @Transactional
    public void delete(Long id) {
        breakerRepository.deleteByPanel_Id(id);
        breakerPanelRepository.deleteById(id);
    }
}
