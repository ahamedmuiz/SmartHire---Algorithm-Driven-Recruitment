package lk.ijse.backend.repository;

import lk.ijse.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    // Custom method for HR to get all applications for a specific job, ordered by score!
    List<JobApplication> findByJobIdOrderByMatchScoreDesc(Long jobId);

    // Custom method for a candidate to see their own applications
    List<JobApplication> findByCandidateId(Long candidateId);
}