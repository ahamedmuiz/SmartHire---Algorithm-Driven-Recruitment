package lk.ijse.backend.service;

import lk.ijse.backend.dto.JobRequestDTO;
import lk.ijse.backend.dto.JobResponseDTO;
import java.util.List;

public interface JobService {
    JobResponseDTO createJob(JobRequestDTO request, String hrEmail);
    List<JobResponseDTO> getAllJobs(); // Used by Freelancers
    List<JobResponseDTO> getMyJobs(String hrEmail); // Used by Clients
    JobResponseDTO updateJob(Long jobId, JobRequestDTO request, String hrEmail); // Edit feature
    void deleteJob(Long jobId, String hrEmail); // Delete feature
}