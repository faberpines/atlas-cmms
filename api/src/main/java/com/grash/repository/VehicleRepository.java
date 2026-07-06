package com.grash.repository;

import com.grash.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Sort;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long>, JpaSpecificationExecutor<Vehicle> {
    Collection<Vehicle> findByCompany_Id(Long id);
    List<Vehicle> findByCompany_Id(Long id, Sort sort);
    Optional<Vehicle> findByIdAndCompany_Id(Long id, Long companyId);
    Optional<Vehicle> findByVinAndCompany_Id(String vin, Long companyId);
}
