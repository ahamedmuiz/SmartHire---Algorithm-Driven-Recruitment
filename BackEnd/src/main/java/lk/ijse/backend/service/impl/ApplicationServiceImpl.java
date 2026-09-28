package lk.ijse.backend.service.impl;

import lk.ijse.backend.dto.ApplicationResponseDTO;
import lk.ijse.backend.entity.JobApplication;
import lk.ijse.backend.entity.JobPosting;
import lk.ijse.backend.entity.User;
import lk.ijse.backend.repository.JobApplicationRepository;
import lk.ijse.backend.repository.JobPostingRepository;
import lk.ijse.backend.repository.UserRepository;
import lk.ijse.backend.service.ApplicationService;
import lk.ijse.backend.service.EmailService;
import lk.ijse.backend.util.PdfParserUtil;
import lk.ijse.backend.util.ScoringAlgorithmUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final PdfParserUtil pdfParserUtil;
    private final ScoringAlgorithmUtil scoringAlgorithmUtil;
    private final EmailService emailService;

    public ApplicationServiceImpl(JobApplicationRepository applicationRepository, JobPostingRepository jobPostingRepository, UserRepository userRepository, PdfParserUtil pdfParserUtil, ScoringAlgorithmUtil scoringAlgorithmUtil, EmailService emailService) {
        this.applicationRepository = applicationRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.userRepository = userRepository;
        this.pdfParserUtil = pdfParserUtil;
        this.scoringAlgorithmUtil = scoringAlgorithmUtil;
        this.emailService = emailService;
    }

    @Override
    public void submitApplication(Long jobId, MultipartFile resumeFile, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail).orElseThrow(() -> new RuntimeException("Candidate not found"));
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));


        JobApplication existingApp = applicationRepository.findByCandidateId(candidate.getId()).stream()
                .filter(app -> app.getJob().getId().equals(jobId))
                .findFirst().orElse(null);

        if (existingApp != null) {
            if (!"WITHDRAWN".equals(existingApp.getStatus())) {
                throw new RuntimeException("You have already applied for this job.");
            }

            applicationRepository.delete(existingApp);
            applicationRepository.flush();
        }

        try {
            String resumeText = pdfParserUtil.extractText(resumeFile);
            int score = scoringAlgorithmUtil.calculateScore(resumeText, job.getRequiredSkills());

            JobApplication application = JobApplication.builder()
                    .candidate(candidate).job(job).resumeText(resumeText).resumeFile(resumeFile.getBytes())
                    .matchScore(score).status("APPLIED").appliedAt(LocalDateTime.now())
                    .build();
            applicationRepository.save(application);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process application", e);
        }
    }

    @Override
    public List<ApplicationResponseDTO> getApplicationsByJob(Long jobId) {
        return applicationRepository.findByJobIdOrderByMatchScoreDesc(jobId).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public List<ApplicationResponseDTO> getMyApplications(String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail).orElseThrow(() -> new RuntimeException("Candidate not found"));
        return applicationRepository.findByCandidateId(candidate.getId()).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public void updateStatus(Long applicationId, String newStatus) {
        JobApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));
        application.setStatus(newStatus);
        applicationRepository.save(application);

        if (List.of("SHORTLISTED", "HIRED", "REJECTED").contains(newStatus.toUpperCase())) {
            emailService.sendStatusUpdateEmail(application.getCandidate().getEmail(), application.getCandidate().getFullName(), newStatus, application.getJob().getTitle());
        }
    }

    @Override
    public void withdrawApplication(Long applicationId, String candidateEmail) {
        User candidate = userRepository.findByEmail(candidateEmail).orElseThrow(() -> new RuntimeException("Candidate not found"));
        JobApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getCandidate().getId().equals(candidate.getId())) throw new RuntimeException("Unauthorized to withdraw this application.");

        application.setStatus("WITHDRAWN");
        applicationRepository.save(application);
    }

    @Override
    public byte[] downloadResume(Long applicationId, String hrEmail) {
        User hrUser = userRepository.findByEmail(hrEmail).orElseThrow(() -> new RuntimeException("HR User not found"));
        JobApplication application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found"));

        if (!application.getJob().getHr().getId().equals(hrUser.getId())) throw new RuntimeException("Unauthorized to download this resume.");
        return application.getResumeFile();
    }

    private ApplicationResponseDTO mapToDTO(JobApplication app) {
        return ApplicationResponseDTO.builder()
                .id(app.getId())
                .jobId(app.getJob().getId())
                .candidateName(app.getCandidate().getFullName())
                .jobTitle(app.getJob().getTitle())
                .matchScore(app.getMatchScore())
                .status(app.getStatus())
                .build();
    }
}