package lk.ijse.backend.service.impl;

import lk.ijse.backend.dto.JobRequestDTO;
import lk.ijse.backend.dto.JobResponseDTO;
import lk.ijse.backend.entity.JobApplication;
import lk.ijse.backend.entity.JobPosting;
import lk.ijse.backend.entity.User;
import lk.ijse.backend.repository.JobApplicationRepository;
import lk.ijse.backend.repository.JobPostingRepository;
import lk.ijse.backend.repository.UserRepository;
import lk.ijse.backend.service.JobService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    public JobServiceImpl(JobPostingRepository jobPostingRepository, UserRepository userRepository, JobApplicationRepository jobApplicationRepository) {
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository = userRepository;
        this.jobApplicationRepository = jobApplicationRepository;
    }

    @Override
    public JobResponseDTO createJob(JobRequestDTO request, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ROLE_HR".equals(hrUser.getRole())) throw new RuntimeException("Unauthorized: Only Clients can post jobs.");

        JobPosting job = JobPosting.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .requiredSkills(request.getRequiredSkills())
                .createdAt(LocalDateTime.now())
                .hr(hrUser)
                .build();
        return mapToResponseDTO(jobPostingRepository.save(job));
    }

    @Override
    public List<JobResponseDTO> getAllJobs() {
        return jobPostingRepository.findAll().stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDTO> getMyJobs(String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow(() -> new RuntimeException("User not found"));
        return jobPostingRepository.findByHrId(hrUser.getId()).stream().map(this::mapToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public JobResponseDTO updateJob(Long jobId, JobRequestDTO request, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow(() -> new RuntimeException("User not found"));
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getHr().getId().equals(hrUser.getId())) throw new RuntimeException("Unauthorized: You can only edit your own jobs.");

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequiredSkills(request.getRequiredSkills());
        return mapToResponseDTO(jobPostingRepository.save(job));
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow(() -> new RuntimeException("User not found"));
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        if (!job.getHr().getId().equals(hrUser.getId())) throw new RuntimeException("Unauthorized: You can only delete your own jobs.");

        List<JobApplication> applications = jobApplicationRepository.findByJobIdOrderByMatchScoreDesc(jobId);
        jobApplicationRepository.deleteAll(applications);
        jobPostingRepository.delete(job);
    }

    private JobResponseDTO mapToResponseDTO(JobPosting job) {
        return JobResponseDTO.builder()
                .id(job.getId()).title(job.getTitle()).description(job.getDescription())
                .requiredSkills(job.getRequiredSkills()).createdAt(job.getCreatedAt()).hrName(job.getHr().getFullName())
                .build();
    }
}