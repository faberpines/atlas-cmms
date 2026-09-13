package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class HazardousWasteDisposal extends CompanyAudit {

    @NotNull
    private LocalDate disposalDate;

    @NotBlank
    private String material;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private Double amount;

    @NotBlank
    private String unit;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
