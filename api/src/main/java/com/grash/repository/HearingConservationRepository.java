package com.grash.repository;

import com.grash.model.HearingConservationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface HearingConservationRepository extends JpaRepository<HearingConservationRecord, Long>,
        JpaSpecificationExecutor<HearingConservationRecord> {

    List<HearingConservationRecord> findByCompany_Id(Long companyId);
}
