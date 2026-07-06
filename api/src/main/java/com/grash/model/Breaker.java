package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
public class Breaker extends CompanyAudit {

    /** Short identifier shown in dropdown, e.g. "B12", "MCC-3A" */
    @NotNull
    private String label;

    /** Circuit number on the panel */
    private String circuitNumber;

    /** Amperage rating */
    private Integer amperage;

    /** Description of what this breaker controls */
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(nullable = false)
    private BreakerPanel panel;
}
