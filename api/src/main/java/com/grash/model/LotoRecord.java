package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import com.grash.model.enums.loto.EnergyType;
import com.grash.model.enums.loto.LotoStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
public class LotoRecord extends CompanyAudit {

    @NotNull
    private String title;

    /** Free-text description: "Breaker 12B", "Main disconnect MCC-3A", etc. */
    @NotNull
    private String isolationPoint;

    @Enumerated(EnumType.STRING)
    private EnergyType energyType = EnergyType.ELECTRICAL;

    @Enumerated(EnumType.STRING)
    private LotoStatus status = LotoStatus.ACTIVE;

    /** Why the equipment is being locked/tagged out */
    @Column(columnDefinition = "TEXT")
    private String reason;

    /** Step-by-step procedure text */
    @Column(columnDefinition = "TEXT")
    private String procedure;

    /** Optional link to an existing asset */
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Asset asset;

    /** The user who applied the lockout/tagout */
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private OwnUser taggedBy;

    private Instant taggedAt = Instant.now();
    private Instant expectedReleaseAt;

    /** Set when released */
    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private OwnUser releasedBy;

    private Instant releasedAt;

    private String notes;
}
