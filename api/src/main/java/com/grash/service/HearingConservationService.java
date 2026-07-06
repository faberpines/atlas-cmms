package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.HearingConservationRecord;
import com.grash.repository.HearingConservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HearingConservationService {

    private final HearingConservationRepository repository;

    public HearingConservationRecord create(HearingConservationRecord record) {
        return repository.save(record);
    }

    public HearingConservationRecord update(Long id, HearingConservationRecord patch) {
        HearingConservationRecord existing = repository.findById(id)
                .orElseThrow(() -> new CustomException("Hearing Conservation record not found", HttpStatus.NOT_FOUND));
        if (patch.getProgramDate() != null) existing.setProgramDate(patch.getProgramDate());
        if (patch.getProgramAdmin() != null) existing.setProgramAdmin(patch.getProgramAdmin());
        if (patch.getReviewDate() != null) existing.setReviewDate(patch.getReviewDate());
        if (patch.getNoiseAreas() != null) existing.setNoiseAreas(patch.getNoiseAreas());
        if (patch.getHpdDevices() != null) existing.setHpdDevices(patch.getHpdDevices());
        if (patch.getHpdStorageLocations() != null) existing.setHpdStorageLocations(patch.getHpdStorageLocations());
        if (patch.getRequiredUseAreas() != null) existing.setRequiredUseAreas(patch.getRequiredUseAreas());
        if (patch.getAudiometricPositions() != null) existing.setAudiometricPositions(patch.getAudiometricPositions());
        if (patch.getAudiometricProvider() != null) existing.setAudiometricProvider(patch.getAudiometricProvider());
        if (patch.getAudiometricSchedule() != null) existing.setAudiometricSchedule(patch.getAudiometricSchedule());
        if (patch.getBaselineProcedure() != null) existing.setBaselineProcedure(patch.getBaselineProcedure());
        if (patch.getAnnualProcedure() != null) existing.setAnnualProcedure(patch.getAnnualProcedure());
        if (patch.getThresholdShiftProcedure() != null) existing.setThresholdShiftProcedure(patch.getThresholdShiftProcedure());
        if (patch.getTrainingProgram() != null) existing.setTrainingProgram(patch.getTrainingProgram());
        if (patch.getTrainingTopics() != null) existing.setTrainingTopics(patch.getTrainingTopics());
        if (patch.getTrainingSchedule() != null) existing.setTrainingSchedule(patch.getTrainingSchedule());
        if (patch.getNoiseMeasurementRecordsLocation() != null) existing.setNoiseMeasurementRecordsLocation(patch.getNoiseMeasurementRecordsLocation());
        if (patch.getAudiometricRecordsLocation() != null) existing.setAudiometricRecordsLocation(patch.getAudiometricRecordsLocation());
        if (patch.getRecordsAccessProcedure() != null) existing.setRecordsAccessProcedure(patch.getRecordsAccessProcedure());
        if (patch.getLastEvaluationDate() != null) existing.setLastEvaluationDate(patch.getLastEvaluationDate());
        if (patch.getEvaluationNotes() != null) existing.setEvaluationNotes(patch.getEvaluationNotes());
        if (patch.getDeficienciesFound() != null) existing.setDeficienciesFound(patch.getDeficienciesFound());
        if (patch.getCorrectiveActions() != null) existing.setCorrectiveActions(patch.getCorrectiveActions());
        return repository.save(existing);
    }

    public List<HearingConservationRecord> findByCompany(Long companyId) {
        return repository.findByCompany_Id(companyId);
    }

    public Optional<HearingConservationRecord> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<HearingConservationRecord> findByIdAndCompany(Long id, Long companyId) {
        return repository.findByCompany_Id(companyId)
                .stream().filter(r -> r.getId().equals(id)).findFirst();
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
