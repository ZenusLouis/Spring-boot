package com.example.keycloak.service;

import com.example.keycloak.dto.ContactDTO;
import com.example.keycloak.entity.Contact;
import com.example.keycloak.entity.User;
import com.example.keycloak.repository.ContactRepository;
import com.example.keycloak.repository.UserRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ContactService {

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    public String saveContactAndSendEmail(String email, String message) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Contact contact = new Contact();
        contact.setUser(user);
        contact.setMessage(message);
        contactRepository.save(contact);

        try {
            emailService.sendContactEmail(user.getEmail(), message);
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Error while sending email!";
        }

        return "Email Sent Successfully and Contact Saved!";
    }

    public Page<ContactDTO> getContactsWithUserInfo(int page, int size) {
        Page<Contact> contactsPage = contactRepository.findAll(PageRequest.of(page, size));
        List<ContactDTO> contactResponses = new ArrayList<>();

        for (Contact contact : contactsPage) {
            Long userId = contact.getUser().getId();
            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                ContactDTO contactResponse = new ContactDTO(
                        contact.getId(),
                        contact.getMessage(),
                        contact.getCreatedAt(),
                        contact.getUpdatedAt(),
                        user.getId(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getFirstName(),
                        user.getLastName()
                );
                contactResponses.add(contactResponse);
            }
        }

        return contactsPage.map(contact -> new ContactDTO(
                contact.getId(),
                contact.getMessage(),
                contact.getCreatedAt(),
                contact.getUpdatedAt(),
                contact.getUser().getId(),
                contact.getUser().getEmail(),
                contact.getUser().getUsername(),
                contact.getUser().getFirstName(),
                contact.getUser().getLastName()
        ));
    }

    public List<Contact> getUserContacts(String email) {
        return contactRepository.findByUserEmail(email);
    }
}
