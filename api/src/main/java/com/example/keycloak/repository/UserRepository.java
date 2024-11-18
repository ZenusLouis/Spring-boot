package com.example.keycloak.repository;

import com.example.keycloak.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    @Query("SELECT u.id FROM User u WHERE u.username = :username")
    Optional<Long> findIdByUsername(@Param("username") String username);

    Optional<User> findByEmail(String email);

    Optional<User> findById(Long id);

    boolean existsByUsername(String username);
}
