package com.grash.controller;

import com.grash.dto.SuccessResponse;
import com.grash.exception.CustomException;
import com.grash.model.File;
import com.grash.model.JhaDocument;
import com.grash.model.OwnUser;
import com.grash.model.enums.PermissionEntity;
import com.grash.model.enums.RoleType;
import com.grash.service.FileService;
import com.grash.service.JhaDocumentService;
import com.grash.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import com.grash.factory.StorageServiceFactory;

@RestController
@RequestMapping("/jha")
@Tag(name = "jha")
@RequiredArgsConstructor
public class JhaController {

    private final JhaDocumentService jhaDocumentService;
    private final FileService fileService;
    private final StorageServiceFactory storageServiceFactory;
    private final UserService userService;

    @Value("${api.host}")
    private String apiHost;

    @GetMapping("")
    @PreAuthorize("permitAll()")
    public Collection<Map<String, Object>> getAll(HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (user.getRole().getRoleType().equals(RoleType.ROLE_CLIENT)) {
            if (!user.getRole().getViewPermissions().contains(PermissionEntity.JHA)) {
                throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
            }
        }
        List<JhaDocument> docs = jhaDocumentService.findByCompany(user.getCompany().getId());
        return buildResponse(docs);
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Map<String, Object>> create(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam("file") MultipartFile uploadedFile,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        if (!user.getRole().getCreatePermissions().contains(PermissionEntity.JHA)) {
            throw new CustomException("Access Denied", HttpStatus.FORBIDDEN);
        }
        // Store file in MinIO
        String filePath = storageServiceFactory.getStorageService().upload(uploadedFile, "jha");
        File file = fileService.create(new File(uploadedFile.getOriginalFilename(), filePath,
                com.grash.model.enums.FileType.OTHER, null, false));

        JhaDocument doc = new JhaDocument();
        doc.setTitle(title);
        doc.setDescription(description);
        doc.setCategory(category);
        doc.setFile(file);
        doc.setCompany(user.getCompany());
        JhaDocument saved = jhaDocumentService.create(doc);
        return ResponseEntity.ok(toMap(saved));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @RequestBody JhaDocument patch,
            HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        jhaDocumentService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("JHA document not found", HttpStatus.NOT_FOUND));
        JhaDocument updated = jhaDocumentService.update(id, patch);
        return ResponseEntity.ok(toMap(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_CLIENT')")
    public ResponseEntity<SuccessResponse> delete(@PathVariable Long id, HttpServletRequest req) {
        OwnUser user = userService.whoami(req);
        jhaDocumentService.findByIdAndCompany(id, user.getCompany().getId())
                .orElseThrow(() -> new CustomException("JHA document not found", HttpStatus.NOT_FOUND));
        jhaDocumentService.delete(id);
        return ResponseEntity.ok(new SuccessResponse(true, "Deleted successfully"));
    }

    private Collection<Map<String, Object>> buildResponse(List<JhaDocument> docs) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (JhaDocument doc : docs) {
            result.add(toMap(doc));
        }
        return result;
    }

    private Map<String, Object> toMap(JhaDocument doc) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doc.getId());
        map.put("title", doc.getTitle());
        map.put("description", doc.getDescription());
        map.put("category", doc.getCategory());
        map.put("createdAt", doc.getCreatedAt());
        map.put("updatedAt", doc.getUpdatedAt());
        if (doc.getFile() != null) {
            Map<String, Object> fileMap = new LinkedHashMap<>();
            fileMap.put("id", doc.getFile().getId());
            fileMap.put("name", doc.getFile().getName());
            fileMap.put("url", apiHost + "/files/view/" + doc.getFile().getId());
            map.put("file", fileMap);
        }
        return map;
    }
}
