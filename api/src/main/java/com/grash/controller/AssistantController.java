package com.grash.controller;

import com.grash.dto.AssistantChatRequest;
import com.grash.exception.CustomException;
import com.grash.model.OwnUser;
import com.grash.model.enums.RoleCode;
import com.grash.service.AssistantService;
import com.grash.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;
    private final UserService userService;

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

    /** ADMIN and LIMITED_ADMIN only */
    @PostMapping("/chat")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody AssistantChatRequest request,
            HttpServletRequest req) {

        OwnUser user = userService.whoami(req);
        RoleCode roleCode = user.getRole() != null ? user.getRole().getCode() : null;

        if (roleCode != RoleCode.ADMIN && roleCode != RoleCode.LIMITED_ADMIN) {
            throw new CustomException("Access restricted to Administrator accounts", HttpStatus.FORBIDDEN);
        }

        String response = assistantService.chat(
                request.getMessage(),
                request.getHistory() != null ? request.getHistory() : Collections.emptyList(),
                user,
                request.getLanguage() != null ? request.getLanguage() : "en"
        );

        return ResponseEntity.ok(Map.of("response", response));
    }
}
