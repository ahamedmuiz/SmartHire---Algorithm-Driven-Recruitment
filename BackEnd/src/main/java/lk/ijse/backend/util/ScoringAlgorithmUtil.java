package lk.ijse.backend.util;

import org.springframework.stereotype.Component;

@Component
public class ScoringAlgorithmUtil {

    public int calculateScore(String resumeText, String requiredSkills) {
        if (resumeText == null || requiredSkills == null || requiredSkills.isEmpty()) {
            return 0;
        }

        String lowerResume = resumeText.toLowerCase();
        String[] skills = requiredSkills.toLowerCase().split(",");

        int matchCount = 0;

        for (String skill : skills) {

            if (lowerResume.contains(skill.trim())) {
                matchCount++;
            }
        }

        return (matchCount * 100) / skills.length;
    }
}