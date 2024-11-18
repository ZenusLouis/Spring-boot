    package com.example.keycloak.repository;

    import org.springframework.data.jpa.repository.JpaRepository;
    import com.example.keycloak.entity.Contact;

    import java.util.List;

    public interface ContactRepository extends JpaRepository<Contact, Long> {
        List<Contact> findByUserEmail(String email);

        List<Contact> findAllByUserId(Long userId);

        List<Contact> findAll();
    }
