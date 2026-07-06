package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
public class VehicleLocation extends CompanyAudit {

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(nullable = false)
    private Vehicle vehicle;

    private Double latitude;
    private Double longitude;
    private Double speed;      // km/h
    private Double heading;    // degrees 0-360
    private Double altitude;   // meters

    private String deviceId;   // LoRa device EUI or identifier
    private Instant recordedAt;
}
