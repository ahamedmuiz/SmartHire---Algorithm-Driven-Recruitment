package lk.ijse.backend.dto;

import lombok.Data;

@Data
public class JobRequestDTO {
    private String title;
    private String description;
    private String requiredSkills;
}