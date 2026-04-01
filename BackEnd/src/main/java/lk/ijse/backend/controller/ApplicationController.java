package lk.ijse.backend.controller;

import lk.ijse.backend.dto.ApplicationResponseDTO;
import lk.ijse.backend.service.ApplicationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @DeleteMapping("/{id}/withdraw")
    public ResponseEntity<String> withdrawApplication(@PathVariable Long id, Authentication authentication) {
        applicationService.withdrawApplication(id, authentication.getName());
        return ResponseEntity.ok("Application withdrawn successfully");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadResume(@PathVariable Long id, Authentication authentication) {
        byte[] pdfBytes = applicationService.downloadResume(id, authentication.getName());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"candidate_resume.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}