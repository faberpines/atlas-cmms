package com.grash.repository;

import com.grash.model.BreakerPanel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BreakerPanelRepository extends JpaRepository<BreakerPanel, Long> {
    List<BreakerPanel> findByCompany_Id(Long companyId);
}
