package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.JhaDocument;
import com.grash.repository.JhaDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class JhaDocumentService {

    private final JhaDocumentRepository repository;

    public JhaDocument create(JhaDocument doc) {
        return repository.save(doc);
    }

    public JhaDocument update(Long id, JhaDocument patch) {
        JhaDocument existing = repository.findById(id)
                .orElseThrow(() -> new CustomException("JHA document not found", HttpStatus.NOT_FOUND));
        if (patch.getTitle() != null) existing.setTitle(patch.getTitle());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        if (patch.getFile() != null) existing.setFile(patch.getFile());
        return repository.save(existing);
    }

    public List<JhaDocument> findByCompany(Long companyId) {
        return repository.findByCompany_IdOrderByCreatedAtDesc(companyId);
    }

    public Optional<JhaDocument> findByIdAndCompany(Long id, Long companyId) {
        return repository.findByIdAndCompany_Id(id, companyId);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
