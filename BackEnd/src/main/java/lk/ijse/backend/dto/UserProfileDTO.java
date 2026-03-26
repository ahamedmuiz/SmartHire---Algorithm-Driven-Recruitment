package lk.ijse.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileDTO {
    private String fullName;
    private String email;
    private String password; // Optional: Only provided if they want to change it
}