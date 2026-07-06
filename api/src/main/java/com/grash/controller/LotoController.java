package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.LotoRecord;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.model.enums.loto.LotoStatus;
import com.grash.service.LotoRecordService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.Collection;

@RestController
@RequestMapping("/loto")
@Tag(name = "loto")
@RequiredArgsConstructor
public class LotoController {

    private final LotoRecordService lotoRecordService;
    private final UserService userService;

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<LotoRecord> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.LOTO)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        return lotoRecordService.findByCompany(user.getCompany().getId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public LotoRecord getById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return lotoRecordService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("LOTO record not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<LotoRecord> create(@Valid @RequestBody LotoRecord record, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getCreatePermissions().contains(PermissionEntity.LOTO)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        record.setCompany(user.getCompany());
        return ResponseEntity.ok(lotoRecordService.create(record));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<LotoRecord> update(@PathVariable Long id,
                                             @RequestBody LotoRecord patch,
                                             HttpServletRequest req) {
        userService.whoami(req);
        return ResponseEntity.ok(lotoRecordService.update(id, patch));
    }

    @PostMapping("/{id}/release")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<LotoRecord> release(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        LotoRecord record = lotoRecordService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("LOTO record not found", HttpStatus.NOT_FOUND));
        LotoRecord patch = new LotoRecord();
        patch.setStatus(LotoStatus.RELEASED);
        patch.setReleasedBy(user);
        patch.setReleasedAt(Instant.now());
        return ResponseEntity.ok(lotoRecordService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        lotoRecordService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("LOTO record not found", HttpStatus.NOT_FOUND));
        lotoRecordService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }
}
