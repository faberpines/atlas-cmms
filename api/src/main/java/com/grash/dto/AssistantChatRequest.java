package com.grash.dto;

import lombok.Data;
import java.util.List;

@Data
public class AssistantChatRequest {
    private String message;
    /** Optional prior conversation turns for multi-turn context */
    private List<AssistantMessage> history;
    /** Language code for response language: "en" or "es" */
    private String language;

    @Data
    public static class AssistantMessage {
        private String role;   // "user" or "assistant"
        private String content;
    }
}
