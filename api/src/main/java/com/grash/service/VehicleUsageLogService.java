package com.grash.service;

import com.grash.model.VehicleUsageLog;
import com.grash.repository.VehicleUsageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleUsageLogService {

    private final VehicleUsageLogRepository repository;

    public VehicleUsageLog create(VehicleUsageLog log) {
        return repository.save(log);
    }

    public List<VehicleUsageLog> findByVehicleId(Long vehicleId) {
        return repository.findByVehicle_IdOrderByWeekOfDesc(vehicleId);
    }

    public Optional<VehicleUsageLog> findById(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
