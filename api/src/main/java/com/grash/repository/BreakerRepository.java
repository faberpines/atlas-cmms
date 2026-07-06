package com.grash.repository;

import com.grash.model.Breaker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BreakerRepository extends JpaRepository<Breaker, Long> {
    List<Breaker> findByPanel_Id(Long panelId);
    List<Breaker> findByCompany_Id(Long companyId);
    void deleteByPanel_Id(Long panelId);
}
