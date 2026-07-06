package com.grash.dto;

import com.grash.model.InspectionItemResult;
import com.grash.model.InspectionTemplate;
import com.grash.model.enums.InspectionStatus;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
public class InspectionShowDTO {
    private Long id;
    private InspectionTemplate template;
    private AssetMiniDTO asset;
    private WorkOrderBaseMiniDTO workOrder;
    private InspectionStatus status;
    private Date dueDate;
    private Date completedAt;
    private UserMiniDTO completedBy;
    private FileMiniDTO completedPdf;
    private String notes;
    private List<InspectionItemResult> results;
    private Date createdAt;
    private Date updatedAt;
}
