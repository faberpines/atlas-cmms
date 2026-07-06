package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.WashTankReading;
import com.grash.service.UserService;
import com.grash.service.WashTankReadingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/wash-tank-readings")
@Tag(name = "washTankReading")
@RequiredArgsConstructor
public class WashTankController {

    private final WashTankReadingService service;
    private final UserService userService;

    @GetMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<WashTankReading> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return service.findByCompany(user.getCompany().getId());
    }

    @GetMapping("/tank/{tankNumber}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<WashTankReading> getByTank(@PathVariable Integer tankNumber, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return service.findByCompanyAndTank(user.getCompany().getId(), tankNumber);
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public List<WashTankReading> getWeekly(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return service.findByCompanyAndDateRange(user.getCompany().getId(), from, to);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<WashTankReading> create(@Valid @RequestBody WashTankReading reading,
                                                   HttpServletRequest req) {
        return ResponseEntity.ok(service.create(reading));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<WashTankReading> update(@PathVariable Long id,
                                                   @RequestBody WashTankReading patch,
                                                   HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        service.findById(id)
                .filter(r -> r.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(service.update(id, patch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        service.findById(id)
                .filter(r -> r.getCompany().getId().equals(user.getCompany().getId()))
                .orElseThrow(() -> new CustomException("Not found", HttpStatus.NOT_FOUND));
        service.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted"));
    }
}
