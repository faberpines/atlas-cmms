package com.grash.repository;

import com.grash.model.LotoRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface LotoRecordRepository extends JpaRepository<LotoRecord, Long>,
        JpaSpecificationExecutor<LotoRecord> {

    List<LotoRecord> findByCompany_Id(Long companyId);
}
