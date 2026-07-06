package com.grash.repository;

import com.grash.model.VehicleLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface VehicleLocationRepository extends JpaRepository<VehicleLocation, Long>, JpaSpecificationExecutor<VehicleLocation> {
    List<VehicleLocation> findByVehicle_IdOrderByRecordedAtDesc(Long vehicleId, Pageable pageable);
    Optional<VehicleLocation> findFirstByVehicle_IdOrderByRecordedAtDesc(Long vehicleId);
    List<VehicleLocation> findByVehicle_IdOrderByRecordedAtDesc(Long vehicleId);
}
