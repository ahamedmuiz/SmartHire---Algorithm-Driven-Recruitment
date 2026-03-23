package lk.ijse.backend.controller;

import lk.ijse.backend.dto.JobRequestDTO;
import lk.ijse.backend.dto.JobResponseDTO;
import lk.ijse.backend.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public ResponseEntity<JobResponseDTO> createJob(@RequestBody JobRequestDTO request, Authentication authentication) {
        // authentication.getName() automatically extracts the email from the valid JWT token
        String hrEmail = authentication.getName();
        return ResponseEntity.ok(jobService.createJob(request, hrEmail));
    }

    @GetMapping
    public ResponseEntity<List<JobResponseDTO>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
}