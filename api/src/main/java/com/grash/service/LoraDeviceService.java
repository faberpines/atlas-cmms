package com.grash.service;

import com.grash.exception.CustomException;
import com.grash.model.LoraDevice;
import com.grash.repository.LoraDeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoraDeviceService {

    private final LoraDeviceRepository loraDeviceRepository;

    @Transactional
    public LoraDevice create(LoraDevice device) {
        return loraDeviceRepository.save(device);
    }

    @Transactional
    public LoraDevice update(Long id, LoraDevice patch) {
        LoraDevice existing = loraDeviceRepository.findById(id)
                .orElseThrow(() -> new CustomException("LoRa device not found", HttpStatus.NOT_FOUND));
        if (patch.getDeviceEUI() != null) existing.setDeviceEUI(patch.getDeviceEUI());
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getVehicle() != null) existing.setVehicle(patch.getVehicle());
        existing.setActive(patch.isActive());
        return loraDeviceRepository.save(existing);
    }

    public Optional<LoraDevice> findById(Long id) {
        return loraDeviceRepository.findById(id);
    }

    public Optional<LoraDevice> findByEUI(String deviceEUI) {
        return loraDeviceRepository.findByDeviceEUI(deviceEUI);
    }

    public Optional<LoraDevice> findByEUIAndCompany(String deviceEUI, Long companyId) {
        return loraDeviceRepository.findByDeviceEUIAndCompany_Id(deviceEUI, companyId);
    }

    public Collection<LoraDevice> findByCompany(Long companyId) {
        return loraDeviceRepository.findByCompany_Id(companyId);
    }

    public void delete(Long id) {
        loraDeviceRepository.deleteById(id);
    }
}
