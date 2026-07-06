package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.LotoRecord;
import com.grash.repository.LotoRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LotoRecordService {

    private final LotoRecordRepository lotoRecordRepository;

    public LotoRecord create(LotoRecord record) {
        return lotoRecordRepository.save(record);
    }

    public LotoRecord update(Long id, LotoRecord patch) {
        LotoRecord existing = lotoRecordRepository.findById(id)
                .orElseThrow(() -> new CustomException("LOTO record not found", HttpStatus.NOT_FOUND));
        if (patch.getTitle() != null) existing.setTitle(patch.getTitle());
        if (patch.getIsolationPoint() != null) existing.setIsolationPoint(patch.getIsolationPoint());
        if (patch.getEnergyType() != null) existing.setEnergyType(patch.getEnergyType());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getReason() != null) existing.setReason(patch.getReason());
        if (patch.getProcedure() != null) existing.setProcedure(patch.getProcedure());
        if (patch.getAsset() != null) existing.setAsset(patch.getAsset());
        if (patch.getTaggedBy() != null) existing.setTaggedBy(patch.getTaggedBy());
        if (patch.getTaggedAt() != null) existing.setTaggedAt(patch.getTaggedAt());
        if (patch.getExpectedReleaseAt() != null) existing.setExpectedReleaseAt(patch.getExpectedReleaseAt());
        if (patch.getReleasedBy() != null) existing.setReleasedBy(patch.getReleasedBy());
        if (patch.getReleasedAt() != null) existing.setReleasedAt(patch.getReleasedAt());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return lotoRecordRepository.save(existing);
    }

    public List<LotoRecord> findByCompany(Long companyId) {
        return lotoRecordRepository.findByCompany_Id(companyId);
    }

    public Optional<LotoRecord> findById(Long id) {
        return lotoRecordRepository.findById(id);
    }

    public Optional<LotoRecord> findByIdAndCompany(Long id, Long companyId) {
        return lotoRecordRepository.findByCompany_Id(companyId)
                .stream().filter(r -> r.getId().equals(id)).findFirst();
    }

    public void delete(Long id) {
        lotoRecordRepository.deleteById(id);
    }
}
