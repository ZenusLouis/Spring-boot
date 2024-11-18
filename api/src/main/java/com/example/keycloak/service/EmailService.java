package com.example.keycloak.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String emailSystem;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(emailSystem);
        message.setTo(toEmail);
        message.setSubject("OTP for Password Change");
        message.setText("Your OTP code for password change is: " + otp);
        mailSender.send(message);
    }

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(emailSystem);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
    
    public void sendContactEmail(String userEmail, String message) throws MessagingException {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);

        helper.setFrom(new InternetAddress(userEmail));
        helper.setTo(emailSystem);
        helper.setSubject("Contact Form Submission from " + userEmail);
        helper.setText("User Email: " + userEmail + "\nMessage: " + message);

        mailSender.send(mimeMessage);
    }
}
