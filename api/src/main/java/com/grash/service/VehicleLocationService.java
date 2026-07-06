package com.grash.service;

import com.grash.model.VehicleLocation;
import com.grash.repository.VehicleLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleLocationService {

    private final VehicleLocationRepository vehicleLocationRepository;

    @Transactional
    public VehicleLocation create(VehicleLocation location) {
        return vehicleLocationRepository.save(location);
    }

    public List<VehicleLocation> getHistory(Long vehicleId, int limit) {
        return vehicleLocationRepository.findByVehicle_IdOrderByRecordedAtDesc(
                vehicleId, PageRequest.of(0, limit));
    }

    public List<VehicleLocation> getFullHistory(Long vehicleId) {
        return vehicleLocationRepository.findByVehicle_IdOrderByRecordedAtDesc(vehicleId);
    }

    public Optional<VehicleLocation> getLatest(Long vehicleId) {
        return vehicleLocationRepository.findFirstByVehicle_IdOrderByRecordedAtDesc(vehicleId);
    }
}
