package lk.ijse.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to the candidate who applied
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    // Link to the job they are applying for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosting job;

    @Lob // Used for large amounts of text (the parsed PDF)
    @Column(columnDefinition = "LONGTEXT")
    private String resumeText;

    private Integer matchScore; // The 0-100 score calculated by your algorithm

    @Column(nullable = false)
    private String status; // PENDING, HIRED, REJECTED

    @Column(nullable = false)
    private LocalDateTime appliedAt;
}