package com.grash.dto;

import com.grash.model.enums.InspectionStatus;
import lombok.Data;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class InspectionPostDTO {
    private Long templateId;
    private Long assetId;
    private Long workOrderId;
    private Long preventiveMaintenanceId;
    private InspectionStatus status = InspectionStatus.PENDING;
    private Date dueDate;
    private String notes;
    private List<InspectionItemResultDTO> results = new ArrayList<>();
    private Long completedPdfId;
    private Boolean clearCompletedPdf;
}
