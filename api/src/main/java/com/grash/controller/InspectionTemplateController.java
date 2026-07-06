package com.grash.controller;

import com.grash.dto.InspectionTemplateItemDTO;
import com.grash.dto.InspectionTemplatePostDTO;
import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.*;
import com.grash.model.enums.RoleType;
import com.grash.service.FileService;
import com.grash.service.InspectionTemplateService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/inspection-templates")
@Tag(name = "inspection-template")
@RequiredArgsConstructor
public class InspectionTemplateController {

    private final InspectionTemplateService service;
    private final UserService userService;
    private final FileService fileService;

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<InspectionTemplate> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            return service.findByCompanySettings(user.getCompany().getCompanySettings().getId());
        }
        return service.findByCompanySettings(user.getCompany().getCompanySettings().getId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public InspectionTemplate getById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return service.findById(id)
                .filter(t -> service.belongsToCompany(t, user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public InspectionTemplate create(@RequestBody InspectionTemplatePostDTO dto, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        CompanySettings companySettings = user.getCompany().getCompanySettings();

        InspectionTemplate template = new InspectionTemplate();
        template.setName(dto.getName());
        template.setDescription(dto.getDescription());
        template.setCategory(dto.getCategory());
        template.setCompanySettings(companySettings);

        if (dto.getPdfTemplateId() != null) {
            fileService.findById(dto.getPdfTemplateId())
                    .ifPresent(template::setPdfTemplate);
        }

        if (dto.getItems() != null) {
            template.setItems(dto.getItems().stream().map(itemDto -> {
                InspectionTemplateItem item = new InspectionTemplateItem();
                item.setLabel(itemDto.getLabel());
                item.setDescription(itemDto.getDescription());
                item.setItemType(itemDto.getItemType());
                item.setRequired(itemDto.isRequired());
                item.setDisplayOrder(itemDto.getDisplayOrder());
                return item;
            }).collect(Collectors.toList()));
        }

        return service.create(template);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public InspectionTemplate patch(@PathVariable Long id,
                                     @RequestBody InspectionTemplatePostDTO dto,
                                     HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        InspectionTemplate template = service.findById(id)
                .filter(t -> service.belongsToCompany(t, user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));

        if (dto.getName() != null) template.setName(dto.getName());
        if (dto.getDescription() != null) template.setDescription(dto.getDescription());
        if (dto.getCategory() != null) template.setCategory(dto.getCategory());

        if (dto.getPdfTemplateId() != null) {
            fileService.findById(dto.getPdfTemplateId())
                    .ifPresent(template::setPdfTemplate);
        }

        if (dto.getItems() != null) {
            template.getItems().clear();
            template.getItems().addAll(dto.getItems().stream().map(itemDto -> {
                InspectionTemplateItem item = new InspectionTemplateItem();
                item.setLabel(itemDto.getLabel());
                item.setDescription(itemDto.getDescription());
                item.setItemType(itemDto.getItemType());
                item.setRequired(itemDto.isRequired());
                item.setDisplayOrder(itemDto.getDisplayOrder());
                return item;
            }).collect(Collectors.toList()));
        }

        return service.save(template);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        service.findById(id)
                .filter(t -> service.belongsToCompany(t, user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        service.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }
}
