package com.grash.dto;

import lombok.Data;
import java.util.List;

@Data
public class InspectionTemplatePostDTO {
    private String name;
    private String description;
    private String category;
    private Long pdfTemplateId;
    private List<InspectionTemplateItemDTO> items;
}
