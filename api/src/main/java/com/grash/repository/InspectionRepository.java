package com.grash.repository;

import com.grash.model.Inspection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    Collection<Inspection> findByCompanySettings_Id(Long id);
    Collection<Inspection> findByWorkOrder_Id(Long workOrderId);
    Collection<Inspection> findByPreventiveMaintenance_Id(Long pmId);
    Collection<Inspection> findByAsset_Id(Long assetId);
}
