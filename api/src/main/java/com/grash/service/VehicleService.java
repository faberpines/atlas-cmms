package com.grash.service;

import com.grash.advancedsearch.SearchCriteria;
import com.grash.advancedsearch.SpecificationBuilder;
import com.grash.exception.CustomException;
import com.grash.model.Vehicle;
import com.grash.model.Asset;
import com.grash.model.enums.EquipmentType;
import com.grash.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final EntityManager em;

    @Transactional
    public Vehicle create(Vehicle vehicle) {
        Vehicle saved = vehicleRepository.saveAndFlush(vehicle);
        em.refresh(saved);
        return saved;
    }

    @Transactional
    public Vehicle update(Long id, Vehicle patch) {
        Vehicle existing = vehicleRepository.findById(id)
                .orElseThrow(() -> new CustomException("Vehicle not found", HttpStatus.NOT_FOUND));
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getAssetNumber() != null) existing.setAssetNumber(patch.getAssetNumber());
        if (patch.getAsset() != null) existing.setAsset(patch.getAsset());
        if (patch.getVin() != null) existing.setVin(patch.getVin());
        if (patch.getMake() != null) existing.setMake(patch.getMake());
        if (patch.getModel() != null) existing.setModel(patch.getModel());
        if (patch.getYear() != null) existing.setYear(patch.getYear());
        if (patch.getTrim() != null) existing.setTrim(patch.getTrim());
        if (patch.getEngineType() != null) existing.setEngineType(patch.getEngineType());
        if (patch.getTransmission() != null) existing.setTransmission(patch.getTransmission());
        if (patch.getDriveType() != null) existing.setDriveType(patch.getDriveType());
        if (patch.getBodyClass() != null) existing.setBodyClass(patch.getBodyClass());
        if (patch.getLicensePlate() != null) existing.setLicensePlate(patch.getLicensePlate());
        if (patch.getColor() != null) existing.setColor(patch.getColor());
        if (patch.getMileage() != null) existing.setMileage(patch.getMileage());
        if (patch.getFuelType() != null) existing.setFuelType(patch.getFuelType());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        if (patch.getUsageUnit() != null) existing.setUsageUnit(patch.getUsageUnit());
        if (patch.getAssignedDriver() != null) existing.setAssignedDriver(patch.getAssignedDriver());
        if (patch.getImage() != null) existing.setImage(patch.getImage());
        return vehicleRepository.save(existing);
    }

    public Optional<Vehicle> findById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Optional<Vehicle> findByIdAndCompany(Long id, Long companyId) {
        return vehicleRepository.findByIdAndCompany_Id(id, companyId);
    }

    public Collection<Vehicle> findByCompany(Long companyId) {
        return vehicleRepository.findByCompany_Id(companyId, Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(vehicle -> vehicle.getAsset() == null ||
                        vehicle.getAsset().getEquipmentType() == EquipmentType.FLEET_VEHICLE)
                .toList();
    }

    public Optional<Vehicle> findByAsset(Long assetId) {
        return vehicleRepository.findByAsset_Id(assetId);
    }

    @Transactional
    public void ensureVehicleForAsset(Asset asset) {
        if (asset.getEquipmentType() != EquipmentType.FLEET_VEHICLE) return;
        Vehicle vehicle = findByAsset(asset.getId()).orElseGet(Vehicle::new);
        vehicle.setAsset(asset);
        vehicle.setName(asset.getName());
        vehicle.setAssetNumber(asset.getBarCode());
        vehicle.setVin(asset.getSerialNumber());
        vehicle.setModel(asset.getModel());
        vehicle.setNotes(asset.getDescription());
        vehicle.setImage(asset.getImage());
        vehicleRepository.save(vehicle);
    }

    public Page<Vehicle> findBySearchCriteria(SearchCriteria searchCriteria) {
        SpecificationBuilder<Vehicle> builder = new SpecificationBuilder<>();
        searchCriteria.getFilterFields().forEach(builder::with);
        Pageable page = PageRequest.of(searchCriteria.getPageNum(), searchCriteria.getPageSize(),
                searchCriteria.getDirection(), searchCriteria.getSortField());
        return vehicleRepository.findAll(builder.build(), page);
    }

    public void delete(Long id) {
        vehicleRepository.deleteById(id);
    }

    public boolean exists(Long id) {
        return vehicleRepository.existsById(id);
    }
}
