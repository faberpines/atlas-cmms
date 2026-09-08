package com.grash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ManagedUserCreateDTO {
    @NotBlank @Size(max = 80)
    private String username;
    @NotBlank @Size(min = 8, max = 255)
    private String password;
    @Size(max = 160)
    private String displayName;
    @NotNull
    private Long roleId;
}
