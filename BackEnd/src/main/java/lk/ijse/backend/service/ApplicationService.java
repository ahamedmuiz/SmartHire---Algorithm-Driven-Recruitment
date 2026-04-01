package lk.ijse.backend.service;

import lk.ijse.backend.dto.ApplicationResponseDTO;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface ApplicationService {
    void submitApplication(Long jobId, MultipartFile resumeFile, String candidateEmail);
    List<ApplicationResponseDTO> getApplicationsByJob(Long jobId);
    List<ApplicationResponseDTO> getMyApplications(String candidateEmail);
    void updateStatus(Long applicationId, String newStatus);

    void withdrawApplication(Long applicationId, String candidateEmail);
    byte[] downloadResume(Long applicationId, String hrEmail);
}