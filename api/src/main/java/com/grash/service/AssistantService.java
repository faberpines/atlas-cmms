package com.grash.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.grash.dto.AssistantChatRequest;
import com.grash.model.*;
import com.grash.model.enums.Status;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssistantService {

    @Value("${ASSISTANT_API_URL:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${ASSISTANT_API_KEY:}")
    private String apiKey;

    @Value("${ASSISTANT_MODEL:gpt-4o-mini}")
    private String model;

    private final AssetService assetService;
    private final WorkOrderService workOrderService;
    private final PartService partService;
    private final PreventiveMaintenanceService pmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String translateText(String text, String targetLanguage) {
        if (apiKey == null || apiKey.isBlank() || text == null || text.isBlank()) {
            return text;
        }
        try {
            String langName = "es".equals(targetLanguage) ? "Spanish" : "English";
            String prompt = "Translate the following text to " + langName
                    + ". Return only the translated text, no explanation, no quotes:\n\n" + text;
            return callAI(prompt, null,
                    "You are a precise translator. Output only the translated text, nothing else.");
        } catch (Exception e) {
            log.error("Translation failed", e);
            return text;
        }
    }

    public String chat(String message, List<AssistantChatRequest.AssistantMessage> history, OwnUser user, String language) {
        if (apiKey == null || apiKey.isBlank()) {
            return "⚠️ AI assistant is not configured. Please set ASSISTANT_API_KEY in the server configuration.";
        }
        try {
            String context = buildContext(user, language);
            return callAI(message, history, context);
        } catch (Exception e) {
            log.error("Assistant API call failed", e);
            return "⚠️ Unable to reach the AI service: " + e.getMessage();
        }
    }

    private String buildContext(OwnUser user, String language) {
        Long companyId = user.getCompany().getId();
        boolean isSpanish = "es".equalsIgnoreCase(language);
        StringBuilder sb = new StringBuilder();
        if (isSpanish) {
            sb.append("Eres un asistente de mantenimiento útil para el CMMS (Sistema de Gestión de Mantenimiento Computarizado) de Bay Baby Produce. ");
            sb.append("Ayudas a programar mantenimiento, responder preguntas sobre activos, inventario de piezas, órdenes de trabajo y mantenimiento preventivo. ");
            sb.append("IMPORTANTE: Responde SIEMPRE en español, sin importar el idioma de la pregunta. ");
            sb.append("Sé conciso y práctico. Hoy es ").append(new Date()).append(".\n\n");
        } else {
            sb.append("You are a helpful maintenance assistant for Bay Baby Produce's CMMS (Computerized Maintenance Management System). ");
            sb.append("You help schedule maintenance, answer questions about assets, parts inventory, work orders, and preventive maintenance. ");
            sb.append("Always respond in English. ");
            sb.append("Be concise and practical. Today is ").append(new Date()).append(".\n\n");
        }

        // Assets
        try {
            Collection<Asset> assets = assetService.findByCompany(companyId);
            sb.append("=== ASSETS (").append(assets.size()).append(" total) ===\n");
            assets.stream().limit(50).forEach(a -> {
                sb.append("- ").append(a.getName());
                if (a.getCustomId() != null && !a.getCustomId().isBlank()) sb.append(" [ID: ").append(a.getCustomId()).append("]");
                if (a.getSerialNumber() != null && !a.getSerialNumber().isBlank()) sb.append(" [SN: ").append(a.getSerialNumber()).append("]");
                if (a.getStatus() != null) sb.append(" [Status: ").append(a.getStatus()).append("]");
                if (a.getModel() != null && !a.getModel().isBlank()) sb.append(" [Model: ").append(a.getModel()).append("]");
                sb.append("\n");
            });
        } catch (Exception e) {
            sb.append("Assets unavailable.\n");
        }

        // Work Orders
        try {
            Collection<WorkOrder> wos = workOrderService.findByCompany(companyId);
            long open = wos.stream().filter(w -> w.getStatus() == Status.OPEN || w.getStatus() == Status.IN_PROGRESS).count();
            long overdue = wos.stream().filter(w -> w.getDueDate() != null && w.getDueDate().before(new Date())
                    && w.getStatus() != Status.COMPLETE).count();
            sb.append("\n=== WORK ORDERS ===\n");
            sb.append("Open/In-Progress: ").append(open).append(" | Overdue: ").append(overdue).append("\n");
            wos.stream().filter(w -> w.getStatus() != Status.COMPLETE).limit(30).forEach(w -> {
                sb.append("- [").append(w.getStatus()).append("] ").append(w.getTitle());
                if (w.getDueDate() != null) sb.append(" (due ").append(w.getDueDate()).append(")");
                if (w.getAsset() != null) sb.append(" — Asset: ").append(w.getAsset().getName());
                sb.append("\n");
            });
        } catch (Exception e) {
            sb.append("Work orders unavailable.\n");
        }

        // Parts / Inventory
        try {
            Collection<Part> parts = partService.findByCompany(companyId);
            List<Part> lowStock = parts.stream()
                    .filter(p -> p.getMinQuantity() > 0 && p.getQuantity() < p.getMinQuantity())
                    .collect(Collectors.toList());
            sb.append("\n=== PARTS INVENTORY (").append(parts.size()).append(" parts) ===\n");
            if (!lowStock.isEmpty()) {
                sb.append("LOW STOCK ALERTS: ").append(lowStock.size()).append(" parts below minimum\n");
                lowStock.forEach(p -> sb.append("  ⚠ ").append(p.getName())
                        .append(": ").append(p.getQuantity()).append("/").append(p.getMinQuantity())
                        .append(" min").append(p.getUnit() != null ? " " + p.getUnit() : "").append("\n"));
            }
            parts.stream().limit(40).forEach(p -> sb.append("- ").append(p.getName())
                    .append(": qty ").append(p.getQuantity())
                    .append(p.getUnit() != null ? " " + p.getUnit() : "")
                    .append(p.getBarcode() != null && !p.getBarcode().isBlank() ? " [Barcode: " + p.getBarcode() + "]" : "")
                    .append("\n"));
        } catch (Exception e) {
            sb.append("Parts unavailable.\n");
        }

        // Preventive Maintenance
        try {
            Collection<PreventiveMaintenance> pms = pmService.findByCompany(companyId);
            sb.append("\n=== PREVENTIVE MAINTENANCE (").append(pms.size()).append(" schedules) ===\n");
            pms.stream().limit(30).forEach(pm -> {
                sb.append("- ").append(pm.getName());
                if (pm.getAsset() != null) sb.append(" — Asset: ").append(pm.getAsset().getName());
                sb.append("\n");
            });
        } catch (Exception e) {
            sb.append("PM schedules unavailable.\n");
        }

        return sb.toString();
    }

    private String callAI(String userMessage, List<AssistantChatRequest.AssistantMessage> history, String systemContext) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 1024);

        ArrayNode messages = body.putArray("messages");

        // System message with CMMS context
        ObjectNode sysMsg = messages.addObject();
        sysMsg.put("role", "system");
        sysMsg.put("content", systemContext);

        // Prior conversation history
        if (history != null) {
            for (AssistantChatRequest.AssistantMessage h : history) {
                ObjectNode msg = messages.addObject();
                msg.put("role", h.getRole());
                msg.put("content", h.getContent());
            }
        }

        // Current user message
        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);

        okhttp3.OkHttpClient client = new okhttp3.OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .build();

        okhttp3.RequestBody requestBody = okhttp3.RequestBody.create(
                objectMapper.writeValueAsString(body),
                okhttp3.MediaType.parse("application/json")
        );

        okhttp3.Request request = new okhttp3.Request.Builder()
                .url(apiUrl)
                .post(requestBody)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .build();

        try (okhttp3.Response response = client.newCall(request).execute()) {
            String responseBody = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful()) {
                log.error("AI API error {}: {}", response.code(), responseBody);
                return "⚠️ AI API returned error " + response.code() + ". Please check your API key configuration.";
            }
            JsonNode json = objectMapper.readTree(responseBody);
            return json.path("choices").get(0).path("message").path("content").asText("No response from AI.");
        }
    }
}
