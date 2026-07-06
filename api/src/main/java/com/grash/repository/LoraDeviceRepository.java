package com.grash.repository;

import com.grash.model.LoraDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.Optional;

public interface LoraDeviceRepository extends JpaRepository<LoraDevice, Long>, JpaSpecificationExecutor<LoraDevice> {
    Collection<LoraDevice> findByCompany_Id(Long id);
    Optional<LoraDevice> findByDeviceEUIAndCompany_Id(String deviceEUI, Long companyId);
    Optional<LoraDevice> findByDeviceEUI(String deviceEUI);
}
