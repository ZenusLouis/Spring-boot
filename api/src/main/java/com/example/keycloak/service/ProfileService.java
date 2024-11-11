package com.example.keycloak.service;

import com.example.keycloak.dto.ProfileDTO;
import com.example.keycloak.entity.User;
import com.example.keycloak.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileService {

    final UserRepository userRepository;

    public ProfileDTO getUserProfile() {
        JwtAuthenticationToken authentication = (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();

        Jwt jwt = authentication.getToken();

        System.out.println("JWT Payload: " + jwt.getClaims());
        String username = jwt.getClaim("preferred_username");
        String email = jwt.getClaim("email");
        String firstName = jwt.getClaim("given_name");
        String lastName = jwt.getClaim("family_name");
        String subjectId = jwt.getClaim("sub");

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        List<String> roles = null;
        if (realmAccess != null) {
            roles = (List<String>) realmAccess.get("roles");
        }

        System.out.println("Roles from realm_access: " + roles);

        User user = userRepository.findByUsername(username).orElse(null);
        Double budget = (user != null) ? user.getBudget() : 0;

        return new ProfileDTO(username, email, firstName, lastName, roles, budget);
    }
}

