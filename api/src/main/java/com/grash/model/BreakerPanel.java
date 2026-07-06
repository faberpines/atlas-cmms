package com.grash.model;

import com.grash.model.abstracts.CompanyAudit;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
public class BreakerPanel extends CompanyAudit {

    @NotNull
    private String name;

    /** Physical location, e.g. "Main Electrical Room", "Shop Floor North" */
    private String location;

    private String notes;
}
