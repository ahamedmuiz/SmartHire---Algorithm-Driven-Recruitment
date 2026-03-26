package lk.ijse.backend.util;

import org.springframework.stereotype.Component;

@Component
public class ScoringAlgorithmUtil {

    public int calculateScore(String resumeText, String requiredSkills) {
        if (resumeText == null || requiredSkills == null || requiredSkills.isEmpty()) {
            return 0;
        }

        // Convert both to lowercase for accurate matching
        String lowerResume = resumeText.toLowerCase();
        String[] skills = requiredSkills.toLowerCase().split(",");

        int matchCount = 0;

        for (String skill : skills) {
            // Trim spaces (e.g., " Java" becomes "Java")
            if (lowerResume.contains(skill.trim())) {
                matchCount++;
            }
        }

        // Calculate the percentage
        return (matchCount * 100) / skills.length;
    }
}