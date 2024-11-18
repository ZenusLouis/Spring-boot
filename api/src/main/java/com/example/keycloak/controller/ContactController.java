package com.example.keycloak.controller;

import com.example.keycloak.dto.ContactDTO;
import com.example.keycloak.dto.ContactRequest;
import com.example.keycloak.entity.Contact;
import com.example.keycloak.service.ContactService;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    @Autowired
    private ContactService contactService;

    @PostMapping("/send-email")
    public String sendEmail(@RequestBody ContactRequest contactRequest) throws MessagingException {
        String email = contactRequest.getEmail();
        String message = contactRequest.getMessage();

        return contactService.saveContactAndSendEmail(email, message);
    }

    @GetMapping("/user-contacts")
    public List<Contact> getUserContacts(@RequestParam String email) {
        return contactService.getUserContacts(email);
    }

    @GetMapping("/all")
    public Page<ContactDTO> getAllContacts(@RequestParam int page, @RequestParam int size) {
        return contactService.getContactsWithUserInfo(page, size);
    }
}
