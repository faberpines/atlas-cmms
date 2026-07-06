package com.grash.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.grash.model.abstracts.DateAudit;
import lombok.*;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionTemplate extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    private String name;

    private String description;

    /** TRUCK, TRAILER, TRACTOR, FACILITY, OTHER — free-form tag */
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private CompanySettings companySettings;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<InspectionTemplateItem> items = new ArrayList<>();

    /** Optional PDF template file stored in MinIO */
    @ManyToOne(fetch = FetchType.LAZY)
    private File pdfTemplate;
}
