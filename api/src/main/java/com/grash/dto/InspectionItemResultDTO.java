package com.grash.dto;

import lombok.Data;

@Data
public class InspectionItemResultDTO {
    private Long id;
    private Long itemId;
    private String value;
    private Boolean passed;
    private String notes;
}
