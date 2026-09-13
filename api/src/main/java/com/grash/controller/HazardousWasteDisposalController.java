package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.HazardousWasteDisposal;
import com.grash.model.OwnUser;
import com.grash.service.HazardousWasteDisposalService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hazardous-waste-disposals")
@Tag(name = "hazardousWasteDisposal")
@RequiredArgsConstructor
public class HazardousWasteDisposalController {
    private final HazardousWasteDisposalService service;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<HazardousWasteDisposal> getAll(HttpServletRequest req) {
        return service.findByCompany(userService.whoami(req).getCompany().getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<HazardousWasteDisposal> create(
            @Valid @RequestBody HazardousWasteDisposal disposal) {
        return ResponseEntity.ok(service.create(disposal));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<HazardousWasteDisposal> update(
            @PathVariable Long id,
            @Valid @RequestBody HazardousWasteDisposal patch,
            HttpServletRequest req) {
        requireCompanyRecord(id, req);
        return ResponseEntity.ok(service.update(id, patch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        requireCompanyRecord(id, req);
        service.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted"));
    }

    private void requireCompanyRecord(Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        HazardousWasteDisposal disposal = service.findById(id);
        if (!disposal.getCompany().getId().equals(user.getCompany().getId())) {
            throw new CustomException("Not found", HttpStatus.NOT_FOUND);
        }
    }
}
