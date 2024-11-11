package com.example.keycloak.controller;

import com.example.keycloak.dto.ProfileDTO;
import com.example.keycloak.service.ProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileController {

    ProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileDTO> getProfile() {
        ProfileDTO profile = profileService.getUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody Map<String, String> payload) {
        String subjectId = payload.get("subjectId");
        System.out.println("Logout request received for subjectId: " + subjectId);
        return ResponseEntity.ok().build();
    }
}
