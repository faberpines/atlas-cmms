package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.HearingConservationRecord;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.HearingConservationService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;

@RestController
@RequestMapping("/hearing-conservation")
@Tag(name = "hearing-conservation")
@RequiredArgsConstructor
public class HearingConservationController {

    private final HearingConservationService hearingConservationService;
    private final UserService userService;

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<HearingConservationRecord> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.HEARING_CONSERVATION)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        return hearingConservationService.findByCompany(user.getCompany().getId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public HearingConservationRecord getById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return hearingConservationService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Hearing Conservation record not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<HearingConservationRecord> create(
            @RequestBody HearingConservationRecord record, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getCreatePermissions().contains(PermissionEntity.HEARING_CONSERVATION)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        record.setCompany(user.getCompany());
        return ResponseEntity.ok(hearingConservationService.create(record));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<HearingConservationRecord> update(
            @PathVariable Long id,
            @RequestBody HearingConservationRecord patch,
            HttpServletRequest req) {
        userService.whoami(req);
        return ResponseEntity.ok(hearingConservationService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        hearingConservationService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Hearing Conservation record not found", HttpStatus.NOT_FOUND));
        hearingConservationService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }
}
