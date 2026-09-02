package com.grash.repository;

import com.grash.model.VehicleUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleUsageLogRepository extends JpaRepository<VehicleUsageLog, Long> {
    List<VehicleUsageLog> findByVehicle_IdOrderByWeekOfDesc(Long vehicleId);
    List<VehicleUsageLog> findByCompanyIdOrderByWeekOfDesc(Long companyId);
}
