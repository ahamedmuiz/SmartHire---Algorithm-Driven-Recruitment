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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobPosting job;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String resumeText;

    // NEW: Store the actual PDF file for downloading
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] resumeFile;

    private Integer matchScore;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime appliedAt;
}