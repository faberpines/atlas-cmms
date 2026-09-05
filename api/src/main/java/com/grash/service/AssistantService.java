package com.grash.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

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

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String translateText(String text, String targetLanguage) {
        if (apiKey == null || apiKey.isBlank() || text == null || text.isBlank()) {
            return text;
        }
        try {
            String langName = "es".equals(targetLanguage) ? "Spanish" : "English";
            String prompt = "Translate the following text to " + langName
                    + ". Return only the translated text, no explanation, no quotes:\n\n" + text;
            return callAI(prompt,
                    "You are a precise translator. Output only the translated text, nothing else.");
        } catch (Exception e) {
            log.error("Translation failed", e);
            return text;
        }
    }

    private String callAI(String userMessage, String systemContext) throws Exception {
        ObjectNode body = objectMapper.createObjectNode();
        body.put("model", model);
        body.put("max_tokens", 1024);

        ArrayNode messages = body.putArray("messages");

        // System message with CMMS context
        ObjectNode sysMsg = messages.addObject();
        sysMsg.put("role", "system");
        sysMsg.put("content", systemContext);

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
