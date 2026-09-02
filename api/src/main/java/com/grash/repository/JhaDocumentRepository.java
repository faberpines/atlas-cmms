package com.grash.repository;

import com.grash.model.JhaDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JhaDocumentRepository extends JpaRepository<JhaDocument, Long> {
    List<JhaDocument> findByCompany_IdOrderByCreatedAtDesc(Long companyId);
    Optional<JhaDocument> findByIdAndCompany_Id(Long id, Long companyId);
}
