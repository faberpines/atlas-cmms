package com.grash.controller;

import com.grash.dto.InspectionItemResultDTO;
import com.grash.dto.InspectionPostDTO;
import com.grash.dto.InspectionShowDTO;
import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.mapper.InspectionMapper;
import com.grash.model.*;
import com.grash.model.enums.InspectionStatus;
import com.grash.model.enums.RoleType;
import com.grash.service.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inspections")
@Tag(name = "inspection")
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;
    private final InspectionTemplateService templateService;
    private final UserService userService;
    private final AssetService assetService;
    private final WorkOrderService workOrderService;
    private final PreventiveMaintenanceService preventiveMaintenanceService;
    private final FileService fileService;
    private final InspectionMapper inspectionMapper;

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<InspectionShowDTO> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return inspectionService.findByCompanySettings(user.getCompany().getCompanySettings().getId())
                .stream().map(inspectionMapper::toShowDto).collect(Collectors.toList());
    }

    @GetMapping("/work-order/{workOrderId}")
    @PreAuthorize("permitAll()")
    public Collection<InspectionShowDTO> getByWorkOrder(@PathVariable Long workOrderId, HttpServletRequest req) {
        return inspectionService.findByWorkOrder(workOrderId)
                .stream().map(inspectionMapper::toShowDto).collect(Collectors.toList());
    }

    @GetMapping("/pm/{pmId}")
    @PreAuthorize("permitAll()")
    public Collection<InspectionShowDTO> getByPM(@PathVariable Long pmId, HttpServletRequest req) {
        return inspectionService.findByPreventiveMaintenance(pmId)
                .stream().map(inspectionMapper::toShowDto).collect(Collectors.toList());
    }

    @GetMapping("/asset/{assetId}")
    @PreAuthorize("permitAll()")
    public Collection<InspectionShowDTO> getByAsset(@PathVariable Long assetId, HttpServletRequest req) {
        return inspectionService.findByAsset(assetId)
                .stream().map(inspectionMapper::toShowDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public InspectionShowDTO getById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return inspectionService.findById(id)
                .filter(i -> inspectionService.belongsToCompany(i, user.getCompany().getId()))
                .map(inspectionMapper::toShowDto)
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public InspectionShowDTO create(@RequestBody InspectionPostDTO dto, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        CompanySettings cs = user.getCompany().getCompanySettings();

        InspectionTemplate template = templateService.findById(dto.getTemplateId())
                .orElseThrow(() -> new CustomException("Template not found", HttpStatus.NOT_FOUND));

        Inspection inspection = new Inspection();
        inspection.setCompanySettings(cs);
        inspection.setTemplate(template);
        inspection.setStatus(dto.getStatus() != null ? dto.getStatus() : InspectionStatus.PENDING);
        inspection.setDueDate(dto.getDueDate());
        inspection.setNotes(dto.getNotes());

        if (dto.getAssetId() != null)
            assetService.findById(dto.getAssetId()).ifPresent(inspection::setAsset);
        if (dto.getWorkOrderId() != null)
            workOrderService.findById(dto.getWorkOrderId()).ifPresent(inspection::setWorkOrder);
        if (dto.getPreventiveMaintenanceId() != null)
            preventiveMaintenanceService.findById(dto.getPreventiveMaintenanceId())
                    .ifPresent(inspection::setPreventiveMaintenance);
        if (dto.getCompletedPdfId() != null)
            fileService.findById(dto.getCompletedPdfId()).ifPresent(inspection::setCompletedPdf);

        applyResults(inspection, dto.getResults(), template);

        if (dto.getStatus() == InspectionStatus.COMPLETED) {
            inspection.setCompletedAt(new Date());
            inspection.setCompletedBy(user);
        }

        return inspectionMapper.toShowDto(inspectionService.create(inspection));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public InspectionShowDTO patch(@PathVariable Long id,
                             @RequestBody InspectionPostDTO dto,
                             HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Inspection inspection = inspectionService.findById(id)
                .filter(i -> inspectionService.belongsToCompany(i, user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));

        if (dto.getStatus() != null) {
            if (dto.getStatus() == InspectionStatus.COMPLETED && inspection.getStatus() != InspectionStatus.COMPLETED) {
                inspection.setCompletedAt(new Date());
                inspection.setCompletedBy(user);
            }
            inspection.setStatus(dto.getStatus());
        }
        if (dto.getDueDate() != null) inspection.setDueDate(dto.getDueDate());
        if (dto.getNotes() != null) inspection.setNotes(dto.getNotes());

        if (dto.getAssetId() != null)
            assetService.findById(dto.getAssetId()).ifPresent(inspection::setAsset);
        if (dto.getWorkOrderId() != null)
            workOrderService.findById(dto.getWorkOrderId()).ifPresent(inspection::setWorkOrder);
        if (dto.getPreventiveMaintenanceId() != null)
            preventiveMaintenanceService.findById(dto.getPreventiveMaintenanceId())
                    .ifPresent(inspection::setPreventiveMaintenance);
        if (Boolean.TRUE.equals(dto.getClearCompletedPdf())) {
            inspection.setCompletedPdf(null);
        } else if (dto.getCompletedPdfId() != null) {
            fileService.findById(dto.getCompletedPdfId()).ifPresent(inspection::setCompletedPdf);
        }

        if (dto.getResults() != null && !dto.getResults().isEmpty()) {
            applyResults(inspection, dto.getResults(), inspection.getTemplate());
        }

        return inspectionMapper.toShowDto(inspectionService.save(inspection));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        inspectionService.findById(id)
                .filter(i -> inspectionService.belongsToCompany(i, user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        inspectionService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }

    private void applyResults(Inspection inspection, List<InspectionItemResultDTO> resultDtos, InspectionTemplate template) {
        if (resultDtos == null) return;
        inspection.getResults().clear();
        inspection.getResults().addAll(resultDtos.stream().map(r -> {
            InspectionItemResult result = new InspectionItemResult();
            template.getItems().stream()
                    .filter(item -> item.getId() != null && item.getId().equals(r.getItemId()))
                    .findFirst()
                    .ifPresent(result::setItem);
            result.setValue(r.getValue());
            result.setPassed(r.getPassed());
            result.setNotes(r.getNotes());
            return result;
        }).filter(r -> r.getItem() != null).collect(Collectors.toList()));
    }
}
