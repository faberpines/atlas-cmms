package com.grash.service;

import com.grash.model.Inspection;
import com.grash.model.enums.InspectionStatus;
import com.grash.repository.InspectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository repository;

    public Collection<Inspection> findByCompanySettings(Long companySettingsId) {
        return repository.findByCompanySettings_Id(companySettingsId);
    }

    public Collection<Inspection> findByWorkOrder(Long workOrderId) {
        return repository.findByWorkOrder_Id(workOrderId);
    }

    public Collection<Inspection> findByPreventiveMaintenance(Long pmId) {
        return repository.findByPreventiveMaintenance_Id(pmId);
    }

    public Collection<Inspection> findByAsset(Long assetId) {
        return repository.findByAsset_Id(assetId);
    }

    public Optional<Inspection> findById(Long id) {
        return repository.findById(id);
    }

    public Inspection create(Inspection inspection) {
        return repository.save(inspection);
    }

    public Inspection save(Inspection inspection) {
        return repository.save(inspection);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public boolean belongsToCompany(Inspection inspection, Long companyId) {
        return inspection.getCompanySettings().getCompany().getId().equals(companyId);
    }
}
