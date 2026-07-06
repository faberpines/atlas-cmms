package com.grash.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grash.model.LoraDevice;
import com.grash.model.VehicleLocation;
import com.grash.service.LoraDeviceService;
import com.grash.service.VehicleLocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Webhook endpoint for receiving GPS payloads from LoRa network servers.
 * Supports TTN v3 and ChirpStack uplink formats.
 *
 * Configure your LoRa network server to POST to: /fleet/lora/uplink
 *
 * Expected payload fields (resolved from either TTN or ChirpStack format):
 *   - deviceEUI (or dev_eui / end_device_ids.dev_eui)
 *   - latitude / longitude / speed / altitude / heading
 */
@RestController
@RequestMapping("/fleet/lora")
@Tag(name = "fleet-lora")
@RequiredArgsConstructor
@Slf4j
public class LoraWebhookController {

    private final LoraDeviceService loraDeviceService;
    private final VehicleLocationService vehicleLocationService;
    private final ObjectMapper objectMapper;

    /**
     * Receives uplink messages from a LoRa network server (TTN v3 or ChirpStack).
     * This endpoint is intentionally public so LoRa servers can POST without
     * managing tokens — secure it at the network/firewall level or via API key header.
     */
    @PostMapping(value = "/uplink", consumes = {"application/json", "text/plain", "*/*"})
    public ResponseEntity<String> receiveUplink(@RequestBody String rawPayload,
                                                @RequestHeader(value = "X-Api-Key", required = false) String apiKey) {
        try {
            Map<String, Object> payload = objectMapper.readValue(rawPayload, new TypeReference<>() {});

            String deviceEUI = resolveDeviceEUI(payload);
            if (deviceEUI == null) {
                log.warn("LoRa uplink received with no device EUI");
                return ResponseEntity.badRequest().body("Missing device EUI");
            }

            Double latitude = resolveDouble(payload, "latitude", "lat");
            Double longitude = resolveDouble(payload, "longitude", "lon", "lng");
            Double speed = resolveDouble(payload, "speed");
            Double altitude = resolveDouble(payload, "altitude", "alt");
            Double heading = resolveDouble(payload, "heading", "course");

            if (latitude == null || longitude == null) {
                log.debug("LoRa uplink from {} has no GPS coordinates", deviceEUI);
                return ResponseEntity.ok("No GPS coordinates — location not stored");
            }

            Optional<LoraDevice> deviceOpt = loraDeviceService.findByEUI(deviceEUI);
            if (deviceOpt.isEmpty() || deviceOpt.get().getVehicle() == null) {
                log.debug("LoRa device {} not mapped to any vehicle", deviceEUI);
                return ResponseEntity.ok("Device not mapped to vehicle");
            }

            LoraDevice device = deviceOpt.get();
            device.setLastSeen(Instant.now());
            loraDeviceService.update(device.getId(), device);

            VehicleLocation loc = new VehicleLocation();
            loc.setVehicle(device.getVehicle());
            loc.setCompany(device.getVehicle().getCompany());
            loc.setLatitude(latitude);
            loc.setLongitude(longitude);
            loc.setSpeed(speed);
            loc.setAltitude(altitude);
            loc.setHeading(heading);
            loc.setDeviceId(deviceEUI);
            loc.setRecordedAt(Instant.now());
            vehicleLocationService.create(loc);

            return ResponseEntity.ok("Location recorded");
        } catch (Exception e) {
            log.error("Error processing LoRa uplink", e);
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

    private String resolveDeviceEUI(Map<String, Object> payload) {
        if (payload.containsKey("deviceEUI")) return (String) payload.get("deviceEUI");
        if (payload.containsKey("dev_eui")) return (String) payload.get("dev_eui");

        if (payload.containsKey("end_device_ids")) {
            Object ids = payload.get("end_device_ids");
            if (ids instanceof Map) {
                Object eui = ((Map<?, ?>) ids).get("dev_eui");
                if (eui != null) return eui.toString();
            }
        }

        if (payload.containsKey("deviceInfo")) {
            Object info = payload.get("deviceInfo");
            if (info instanceof Map) {
                Object eui = ((Map<?, ?>) info).get("devEui");
                if (eui != null) return eui.toString();
            }
        }

        return null;
    }

    @SuppressWarnings("unchecked")
    private Double resolveDouble(Map<String, Object> payload, String... keys) {
        for (String key : keys) {
            if (payload.containsKey(key)) {
                Object val = payload.get(key);
                if (val instanceof Number) return ((Number) val).doubleValue();
                try { return Double.parseDouble(val.toString()); } catch (Exception ignored) {}
            }
        }
        Object decoded = payload.get("decoded_payload");
        if (decoded instanceof Map) {
            for (String key : keys) {
                Object val = ((Map<?, ?>) decoded).get(key);
                if (val instanceof Number) return ((Number) val).doubleValue();
            }
        }
        Object obj = payload.get("object");
        if (obj instanceof Map) {
            for (String key : keys) {
                Object val = ((Map<?, ?>) obj).get(key);
                if (val instanceof Number) return ((Number) val).doubleValue();
            }
        }
        return null;
    }
}
