package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.HazardousWasteDisposal;
import com.grash.repository.HazardousWasteDisposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HazardousWasteDisposalService {
    private final HazardousWasteDisposalRepository repository;

    public List<HazardousWasteDisposal> findByCompany(Long companyId) {
        return repository.findByCompany_IdOrderByDisposalDateDescCreatedAtDesc(companyId);
    }

    public HazardousWasteDisposal create(HazardousWasteDisposal disposal) {
        return repository.save(disposal);
    }

    public HazardousWasteDisposal update(Long id, HazardousWasteDisposal patch) {
        HazardousWasteDisposal existing = findById(id);
        if (patch.getDisposalDate() != null) existing.setDisposalDate(patch.getDisposalDate());
        if (patch.getMaterial() != null) existing.setMaterial(patch.getMaterial());
        if (patch.getAmount() != null) existing.setAmount(patch.getAmount());
        if (patch.getUnit() != null) existing.setUnit(patch.getUnit());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return repository.save(existing);
    }

    public HazardousWasteDisposal findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
