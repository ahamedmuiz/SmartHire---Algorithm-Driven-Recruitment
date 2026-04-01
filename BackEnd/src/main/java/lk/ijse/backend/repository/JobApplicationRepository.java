package lk.ijse.backend.repository;

import lk.ijse.backend.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobIdOrderByMatchScoreDesc(Long jobId);
    List<JobApplication> findByCandidateId(Long candidateId);
}