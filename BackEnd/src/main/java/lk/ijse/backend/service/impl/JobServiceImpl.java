package lk.ijse.backend.service.impl;

import lk.ijse.backend.dto.JobRequestDTO;
import lk.ijse.backend.dto.JobResponseDTO;
import lk.ijse.backend.entity.JobPosting;
import lk.ijse.backend.entity.User;
import lk.ijse.backend.repository.JobPostingRepository;
import lk.ijse.backend.repository.UserRepository;
import lk.ijse.backend.service.JobService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;

    public JobServiceImpl(JobPostingRepository jobPostingRepository, UserRepository userRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository = userRepository;
    }

    @Override
    public JobResponseDTO createJob(JobRequestDTO request, String hrEmail) {
        // Find the logged-in HR user
        User hrUser = userRepository.findByEmail(hrEmail)
                .orElseThrow(() -> new RuntimeException("HR User not found"));

        // Build the new job posting
        JobPosting job = JobPosting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .createdAt(LocalDateTime.now())
                .hr(hrUser)
                .build();

        JobPosting savedJob = jobPostingRepository.save(job);

        return mapToResponseDTO(savedJob);
    }

    @Override
    public List<JobResponseDTO> getAllJobs() {
        return jobPostingRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // Helper method to convert an Entity to a DTO
    private JobResponseDTO mapToResponseDTO(JobPosting job) {
        return JobResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .requiredSkills(job.getRequiredSkills())
                .createdAt(job.getCreatedAt())
                .hrName(job.getHr().getFullName())
                .build();
    }
}