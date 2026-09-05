package com.grash.controller;

import com.grash.service.AssistantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;

    /** Available to all logged-in users */
    @PostMapping("/translate")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Map<String, String>> translate(
            @RequestBody Map<String, String> request) {

        String text = request.get("text");
        String targetLanguage = request.getOrDefault("targetLanguage", "en");

        if (text == null || text.isBlank()) {
            return ResponseEntity.ok(Map.of("translation", ""));
        }
        String translation = assistantService.translateText(text, targetLanguage);
        return ResponseEntity.ok(Map.of("translation", translation));
    }
}
