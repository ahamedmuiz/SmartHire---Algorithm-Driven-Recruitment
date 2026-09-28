package lk.ijse.backend.dto;
import lombok.Data;

@Data
public class JobRequestDTO {
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
}