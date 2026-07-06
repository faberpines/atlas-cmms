package com.grash.service;

import com.grash.model.CompanySettings;
import com.grash.model.InspectionTemplate;
import com.grash.repository.InspectionTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InspectionTemplateService {

    private final InspectionTemplateRepository repository;

    public Collection<InspectionTemplate> findByCompanySettings(Long companySettingsId) {
        return repository.findByCompanySettings_Id(companySettingsId);
    }

    public Optional<InspectionTemplate> findById(Long id) {
        return repository.findById(id);
    }

    public InspectionTemplate create(InspectionTemplate template) {
        return repository.save(template);
    }

    public InspectionTemplate save(InspectionTemplate template) {
        return repository.save(template);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public boolean belongsToCompany(InspectionTemplate template, Long companyId) {
        return template.getCompanySettings().getCompany().getId().equals(companyId);
    }
}
