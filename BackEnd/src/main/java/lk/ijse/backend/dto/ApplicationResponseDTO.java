package lk.ijse.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ApplicationResponseDTO {
    private Long id;
    private String candidateName;
    private String jobTitle;
    private Integer matchScore;
    private String status;
}