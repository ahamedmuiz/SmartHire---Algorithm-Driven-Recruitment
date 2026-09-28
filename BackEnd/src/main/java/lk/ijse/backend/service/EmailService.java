package lk.ijse.backend.service;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendStatusUpdateEmail(String toEmail, String candidateName, String status, String jobTitle) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);

            helper.setTo(toEmail);
            helper.setSubject("SmartHire Application Update: " + jobTitle);
            helper.setFrom(new InternetAddress("ahamedmuiz123@gmail.com", "SmartHire Team"));

            StringBuilder body = new StringBuilder();
            body.append("Hello ").append(candidateName).append(",\n\n");
            body.append("Your application status for the position of '").append(jobTitle).append("' has been updated to: ").append(status).append(".\n\n");

            if ("SHORTLISTED".equalsIgnoreCase(status)) {
                body.append("Congratulations! You have been shortlisted for this role. We will contact you soon with details for an interview.\n\n");
            }

            body.append("Thank you,\nSmartHire Recruitment Team");

            helper.setText(body.toString());
            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}