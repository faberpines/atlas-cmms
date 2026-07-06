package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.Breaker;
import com.grash.model.BreakerPanel;
import com.grash.model.OwnUser;
import com.grash.model.enums.RoleType;
import com.grash.service.BreakerPanelService;
import com.grash.service.BreakerService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/breaker-panels")
@Tag(name = "breakerPanel")
@RequiredArgsConstructor
public class BreakerPanelController {

    private final BreakerPanelService breakerPanelService;
    private final BreakerService breakerService;
    private final UserService userService;

    /* ─── PANELS ─── */

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<BreakerPanel> getAllPanels(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return breakerPanelService.findByCompany(user.getCompany().getId());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public BreakerPanel getPanelById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return breakerPanelService.findById(id)
                .filter(p -> p.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<BreakerPanel> createPanel(@Valid @RequestBody BreakerPanel panel,
                                                     HttpServletRequest req) {
        return ResponseEntity.ok(breakerPanelService.create(panel));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<BreakerPanel> updatePanel(@PathVariable Long id,
                                                     @RequestBody BreakerPanel patch,
                                                     HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        breakerPanelService.findById(id)
                .filter(p -> p.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(breakerPanelService.update(id, patch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> deletePanel(@PathVariable Long id,
                                                        HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        breakerPanelService.findById(id)
                .filter(p -> p.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        breakerPanelService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }

    /* ─── BREAKERS (nested under panel) ─── */

    @GetMapping("/{panelId}/breakers")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<Breaker> getBreakersForPanel(@PathVariable Long panelId, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        breakerPanelService.findById(panelId)
                .filter(p -> p.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        return breakerService.findByPanel(panelId);
    }

    @PostMapping("/{panelId}/breakers")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Breaker> createBreaker(@PathVariable Long panelId,
                                                  @Valid @RequestBody Breaker breaker,
                                                  HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        BreakerPanel panel = breakerPanelService.findById(panelId)
                .filter(p -> p.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Panel not found", HttpStatus.NOT_FOUND));
        breaker.setPanel(panel);
        return ResponseEntity.ok(breakerService.create(breaker));
    }

    @PatchMapping("/breakers/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Breaker> updateBreaker(@PathVariable Long id,
                                                  @RequestBody Breaker patch,
                                                  HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        breakerService.findById(id)
                .filter(b -> b.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(breakerService.update(id, patch));
    }

    @DeleteMapping("/breakers/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> deleteBreaker(@PathVariable Long id,
                                                          HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        breakerService.findById(id)
                .filter(b -> b.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        breakerService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }

    /* ─── ALL BREAKERS for a company (used by LOTO dropdown) ─── */

    @GetMapping("/breakers")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<Breaker> getAllBreakers(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return breakerService.findByCompany(user.getCompany().getId());
    }
}
