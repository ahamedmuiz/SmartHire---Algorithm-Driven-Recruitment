package lk.ijse.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class JobResponseDTO {
    private Long id;
    private String title;
    private String companyName;
    private String location;
    private String jobType;
    private String salaryRange;
    private String experience;
    private String description;
    private String responsibilities;
    private String benefits;
    private String requiredSkills;
    private LocalDateTime createdAt;
    private String hrName;

    private int applicationCount;
    private int shortlistedCount;
    private int hiredCount;
    private int rejectedCount;
}