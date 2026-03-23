package lk.ijse.backend.service;

import lk.ijse.backend.dto.JobRequestDTO;
import lk.ijse.backend.dto.JobResponseDTO;
import java.util.List;

public interface JobService {
    JobResponseDTO createJob(JobRequestDTO request, String hrEmail);
    List<JobResponseDTO> getAllJobs();
}