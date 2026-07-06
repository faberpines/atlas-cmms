package com.grash.controller;

import com.grash.advancedsearch.SearchCriteria;
import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.LoraDevice;
import com.grash.model.OwnUser;
import com.grash.model.Vehicle;
import com.grash.model.VehicleLocation;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.LoraDeviceService;
import com.grash.service.UserService;
import com.grash.service.VehicleLocationService;
import com.grash.service.VehicleService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fleet/vehicles")
@Tag(name = "fleet")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleLocationService vehicleLocationService;
    private final LoraDeviceService loraDeviceService;
    private final UserService userService;
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<Vehicle> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.FLEET)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        return vehicleService.findByCompany(user.getCompany().getId());
    }

    @PostMapping("/search")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Page<Vehicle>> search(@RequestBody SearchCriteria searchCriteria,
                                                HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.FLEET)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
            searchCriteria.filterCompany(user);
        }
        return ResponseEntity.ok(vehicleService.findBySearchCriteria(searchCriteria));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public Vehicle getById(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        return vehicleService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Vehicle not found", HttpStatus.NOT_FOUND));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Vehicle> create(@Valid @RequestBody Vehicle vehicle, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getCreatePermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(vehicleService.create(vehicle));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Vehicle> update(@PathVariable Long id, @RequestBody Vehicle vehicle,
                                          HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        Vehicle existing = vehicleService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Vehicle not found", HttpStatus.NOT_FOUND));
        if (!user.getRole().getEditOtherPermissions().contains(PermissionEntity.FLEET)
                && !existing.getCreatedBy().equals(user.getId())) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(vehicleService.update(id, vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        vehicleService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Vehicle not found", HttpStatus.NOT_FOUND));
        if (!user.getRole().getDeleteOtherPermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        vehicleService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Vehicle deleted"));
    }

    // VIN decode proxy - calls NHTSA free public API
    @GetMapping("/vin/{vin}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Map<String, String>> decodeVin(@PathVariable String vin, HttpServletRequest req) {
        userService.whoami(req); // ensure authenticated
        String url = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/" + vin + "?format=json";
        try {
            Map response = restTemplate.getForObject(url, Map.class);
            Map<String, String> decoded = new HashMap<>();
            if (response != null && response.get("Results") instanceof List) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("Results");
                for (Map<String, Object> item : results) {
                    String variable = (String) item.get("Variable");
                    Object value = item.get("Value");
                    if (value != null && !value.toString().isEmpty() && !value.toString().equals("null")
                            && !value.toString().equals("Not Applicable")) {
                        decoded.put(variable, value.toString());
                    }
                }
            }
            return ResponseEntity.ok(decoded);
        } catch (Exception e) {
            throw new CustomException("VIN decode failed: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }

    // Location history for a specific vehicle
    @GetMapping("/{id}/locations")
    @PreAuthorize("permitAll()")
    public List<VehicleLocation> getLocations(@PathVariable Long id,
                                              @RequestParam(defaultValue = "100") int limit,
                                              HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        vehicleService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("Vehicle not found", HttpStatus.NOT_FOUND));
        return vehicleLocationService.getHistory(id, limit);
    }

    // Latest location for all fleet vehicles (for map view)
    @GetMapping("/locations/latest")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<Map<String, Object>>> getLatestLocations(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)
                && !user.getRole().getViewPermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        Collection<Vehicle> vehicles = vehicleService.findByCompany(user.getCompany().getId());
        List<Map<String, Object>> result = vehicles.stream()
                .map(v -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("vehicle", v);
                    vehicleLocationService.getLatest(v.getId()).ifPresent(loc -> entry.put("location", loc));
                    return entry;
                })
                .filter(e -> e.containsKey("location"))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // LoRa device CRUD
    @GetMapping("/lora-devices")
    @PreAuthorize("permitAll()")
    public Collection<LoraDevice> getLoraDevices(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)
                && !user.getRole().getViewPermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        return loraDeviceService.findByCompany(user.getCompany().getId());
    }

    @PostMapping("/lora-devices")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<LoraDevice> createLoraDevice(@Valid @RequestBody LoraDevice device,
                                                       HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getCreatePermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(loraDeviceService.create(device));
    }

    @PatchMapping("/lora-devices/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<LoraDevice> updateLoraDevice(@PathVariable Long id,
                                                       @RequestBody LoraDevice device,
                                                       HttpServletRequest req) {
        userService.whoami(req);
        return ResponseEntity.ok(loraDeviceService.update(id, device));
    }

    @DeleteMapping("/lora-devices/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> deleteLoraDevice(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getDeleteOtherPermissions().contains(PermissionEntity.FLEET)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        loraDeviceService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "LoRa device deleted"));
    }
}
