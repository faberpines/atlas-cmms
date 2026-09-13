package com.grash.repository;

import com.grash.model.HazardousWasteDisposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HazardousWasteDisposalRepository extends JpaRepository<HazardousWasteDisposal, Long> {
    List<HazardousWasteDisposal> findByCompany_IdOrderByDisposalDateDescCreatedAtDesc(Long companyId);
}
