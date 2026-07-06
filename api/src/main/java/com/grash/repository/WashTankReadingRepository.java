package com.grash.repository;

import com.grash.model.WashTankReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WashTankReadingRepository extends JpaRepository<WashTankReading, Long> {
    List<WashTankReading> findByCompany_IdOrderByReadingDateDescShiftAsc(Long companyId);
    List<WashTankReading> findByCompany_IdAndTankNumberOrderByReadingDateDescShiftAsc(Long companyId, Integer tankNumber);
    List<WashTankReading> findByCompany_IdAndReadingDateBetweenOrderByTankNumberAscReadingDateAscShiftAsc(
            Long companyId, LocalDate from, LocalDate to);
}
