package com.grash.model;

import com.grash.model.enums.InspectionItemType;
import lombok.*;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionTemplateItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @NotNull
    private String label;

    private String description;

    @Enumerated(EnumType.ORDINAL)
    private InspectionItemType itemType = InspectionItemType.PASS_FAIL;

    private boolean required = true;

    private int displayOrder = 0;
}
