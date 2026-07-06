package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import com.grash.model.enums.fleet.FuelType;
import com.grash.model.enums.fleet.VehicleStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
public class Vehicle extends CompanyAudit {

    @NotNull
    private String name;

    private String assetNumber;

    @Column(unique = false)
    private String vin;

    private String make;
    private String model;
    private Integer year;
    private String trim;
    private String engineType;
    private String transmission;
    private String driveType;
    private String bodyClass;

    private String licensePlate;
    private String color;
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    private FuelType fuelType = FuelType.GASOLINE;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status = VehicleStatus.ACTIVE;

    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    private OwnUser assignedDriver;

    @ManyToOne(fetch = FetchType.LAZY)
    private File image;
}
