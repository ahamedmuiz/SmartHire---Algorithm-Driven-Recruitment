package lk.ijse.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class JobResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String requiredSkills;
    private LocalDateTime createdAt;
    private String hrName;
}