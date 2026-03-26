package lk.ijse.backend.controller;

import lk.ijse.backend.dto.ApplicationResponseDTO;
import lk.ijse.backend.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/apply")
    public ResponseEntity<String> applyForJob(
            @RequestParam("jobId") Long jobId,
            @RequestParam("resume") MultipartFile resume,
            Authentication authentication) {

        applicationService.submitApplication(jobId, resume, authentication.getName());
        return ResponseEntity.ok("Application submitted successfully");
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getApplicantsForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJob(jobId));
    }

    // NEW: Endpoint for Freelancers to fetch their application history
    @GetMapping("/my-applications")
    public ResponseEntity<List<ApplicationResponseDTO>> getMyApplications(Authentication authentication) {
        return ResponseEntity.ok(applicationService.getMyApplications(authentication.getName()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status) {

        applicationService.updateStatus(id, status);
        return ResponseEntity.ok("Status updated and email sent");
    }
}