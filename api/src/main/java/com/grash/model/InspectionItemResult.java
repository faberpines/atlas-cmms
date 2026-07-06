package com.grash.model;

import lombok.*;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InspectionItemResult {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne
    @NotNull
    private InspectionTemplateItem item;

    /** For TEXT / NUMBER / DATE / CHECKBOX items */
    private String value;

    /** For PASS_FAIL items: true = pass, false = fail */
    private Boolean passed;

    private String notes;
}
