package com.grash.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class WorkOrderHistoryPostDTO {

    @NotBlank
    @Size(max = 255)
    private String name;
}
