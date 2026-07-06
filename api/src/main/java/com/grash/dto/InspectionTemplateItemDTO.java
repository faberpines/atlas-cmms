package com.grash.dto;

import com.grash.model.enums.InspectionItemType;
import lombok.Data;

@Data
public class InspectionTemplateItemDTO {
    private Long id;
    private String label;
    private String description;
    private InspectionItemType itemType = InspectionItemType.PASS_FAIL;
    private boolean required = true;
    private int displayOrder = 0;
}
