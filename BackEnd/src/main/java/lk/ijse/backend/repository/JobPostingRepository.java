package lk.ijse.backend.repository;

import lk.ijse.backend.entity.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByHrId(Long hrId);
}