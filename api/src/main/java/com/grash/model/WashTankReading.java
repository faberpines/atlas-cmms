package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import com.grash.model.enums.WashTankShift;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class WashTankReading extends CompanyAudit {

    /** 1 = Washtank 1, 2 = Washtank 2 */
    @NotNull
    private Integer tankNumber;

    @NotNull
    private LocalDate readingDate;

    @Enumerated(EnumType.STRING)
    @NotNull
    private WashTankShift shift;

    /** Water turbidity result: true = Pass, false = Fail */
    private Boolean turbidityPass;

    /** Chemical concentration in PPM */
    private Double chemicalPpm;

    /** Chemical remaining in tote (gallons) */
    private Double toteLevelGallons;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /** Who recorded this reading */
    @ManyToOne(fetch = FetchType.EAGER)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private OwnUser recordedBy;
}
