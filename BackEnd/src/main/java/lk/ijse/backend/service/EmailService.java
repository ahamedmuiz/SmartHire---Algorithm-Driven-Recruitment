package lk.ijse.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    // Explicit constructor for dependency injection
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async // Runs in a separate background thread
    public void sendStatusUpdateEmail(String toEmail, String candidateName, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("SmartHire Application Status Update");

        String body = "Hello " + candidateName + ",\n\n" +
                "Your application status for the recent job posting has been updated to: " + status + ".\n\n" +
                "Thank you,\nSmartHire Recruitment Team";

        message.setText(body);
        mailSender.send(message);
    }
}