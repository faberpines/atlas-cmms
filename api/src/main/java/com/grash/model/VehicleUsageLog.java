package com.grash.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;

@Entity
@Table(name = "vehicle_usage_log")
@Data
@NoArgsConstructor
public class VehicleUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(nullable = false)
    private Vehicle vehicle;

    @Column(nullable = false)
    private Long companyId;

    private Long createdBy;

    @Column(nullable = false)
    private LocalDate weekOf;

    /** MILES or HOURS */
    @Column(nullable = false, length = 10)
    private String unitType = "MILES";

    @Column(nullable = false)
    private Double value;

    private String notes;

    private Instant createdAt = Instant.now();

    private Instant updatedAt = Instant.now();
}
