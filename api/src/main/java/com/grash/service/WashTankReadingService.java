package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.WashTankReading;
import com.grash.repository.WashTankReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WashTankReadingService {

    private final WashTankReadingRepository repo;

    public WashTankReading create(WashTankReading reading) {
        return repo.save(reading);
    }

    public WashTankReading update(Long id, WashTankReading patch) {
        WashTankReading existing = repo.findById(id)
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        if (patch.getTankNumber() != null) existing.setTankNumber(patch.getTankNumber());
        if (patch.getReadingDate() != null) existing.setReadingDate(patch.getReadingDate());
        if (patch.getShift() != null) existing.setShift(patch.getShift());
        if (patch.getTurbidityPass() != null) existing.setTurbidityPass(patch.getTurbidityPass());
        if (patch.getChemicalPpm() != null) existing.setChemicalPpm(patch.getChemicalPpm());
        if (patch.getToteLevelGallons() != null) existing.setToteLevelGallons(patch.getToteLevelGallons());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        if (patch.getRecordedBy() != null) existing.setRecordedBy(patch.getRecordedBy());
        return repo.save(existing);
    }

    public List<WashTankReading> findByCompany(Long companyId) {
        return repo.findByCompany_IdOrderByReadingDateDescShiftAsc(companyId);
    }

    public List<WashTankReading> findByCompanyAndTank(Long companyId, Integer tankNumber) {
        return repo.findByCompany_IdAndTankNumberOrderByReadingDateDescShiftAsc(companyId, tankNumber);
    }

    public List<WashTankReading> findByCompanyAndDateRange(Long companyId, LocalDate from, LocalDate to) {
        return repo.findByCompany_IdAndReadingDateBetweenOrderByTankNumberAscReadingDateAscShiftAsc(companyId, from, to);
    }

    public Optional<WashTankReading> findById(Long id) {
        return repo.findById(id);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
