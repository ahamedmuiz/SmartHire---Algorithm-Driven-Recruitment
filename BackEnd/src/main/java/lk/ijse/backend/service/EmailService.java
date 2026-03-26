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
    public void sendStatusUpdateEmail(String toEmail, String candidateName, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false);

            helper.setTo(toEmail);
            helper.setSubject("SmartHire Application Status Update");

            // ✅ Set custom sender name here
            helper.setFrom(new InternetAddress("ahamedmuiz123@gmail.com", "SmartHire Team"));

            String body = "Hello " + candidateName + ",\n\n" +
                    "Your application status for the recent job posting has been updated to: " + status + ".\n\n" +
                    "Thank you,\nSmartHire Recruitment Team";

            helper.setText(body);

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}