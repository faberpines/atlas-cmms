package com.grash.repository;

import com.grash.model.InspectionTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface InspectionTemplateRepository extends JpaRepository<InspectionTemplate, Long> {
    Collection<InspectionTemplate> findByCompanySettings_Id(Long id);
}
