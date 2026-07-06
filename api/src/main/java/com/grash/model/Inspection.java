package com.grash.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.grash.model.abstracts.DateAudit;
import com.grash.model.enums.InspectionStatus;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inspection extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private CompanySettings companySettings;

    @NotNull
    @ManyToOne
    private InspectionTemplate template;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private Asset asset;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private WorkOrder workOrder;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private PreventiveMaintenance preventiveMaintenance;

    @Enumerated(EnumType.ORDINAL)
    private InspectionStatus status = InspectionStatus.PENDING;

    private Date dueDate;

    private Date completedAt;

    @ManyToOne
    private OwnUser completedBy;

    /** Uploaded filled PDF (optional) */
    @ManyToOne
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private File completedPdf;

    private String notes;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "inspection_id")
    private List<InspectionItemResult> results = new ArrayList<>();
}
