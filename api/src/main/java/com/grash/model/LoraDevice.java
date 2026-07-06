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
public class LoraDevice extends CompanyAudit {

    @Column(nullable = false, name = "device_eui")
    private String deviceEUI;

    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Vehicle vehicle;

    private boolean active = true;
    private Instant lastSeen;
}
