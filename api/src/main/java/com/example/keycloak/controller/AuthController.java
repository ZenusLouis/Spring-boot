package com.example.keycloak.controller;

import com.example.keycloak.dto.LoginRequest;
import com.example.keycloak.entity.User;
import com.example.keycloak.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok("User registered successfully with username: " + savedUser.getUsername());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());

        if (user == null) {
            // Nếu không có trong DB, thử xác thực với Keycloak
            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = "http://localhost:8080/realms/myrealm/protocol/openid-connect/token";
            Map<String, String> params = new HashMap<>();
            params.put("client_id", "demo");
            params.put("client_secret", "xEgb7b8Ib2qU66ckfgo2bwyiOWPZ5S56");
            params.put("grant_type", "password");
            params.put("username", loginRequest.getUsername());
            params.put("password", loginRequest.getPassword());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.setAll(params);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
                Map<String, Object> responseBody = new HashMap<>(response.getBody());
                responseBody.put("message", "Authenticated with Keycloak");
                return ResponseEntity.ok(responseBody);
            } catch (HttpClientErrorException e) {
                return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
            }
        } else {
            // Nếu người dùng có trong DB, yêu cầu token từ Keycloak và trả về
            RestTemplate restTemplate = new RestTemplate();
            String tokenUrl = "http://localhost:8080/realms/myrealm/protocol/openid-connect/token";
            Map<String, String> params = new HashMap<>();
            params.put("client_id", "demo");
            params.put("client_secret", "xEgb7b8Ib2qU66ckfgo2bwyiOWPZ5S56");
            params.put("grant_type", "password");
            params.put("username", loginRequest.getUsername());
            params.put("password", loginRequest.getPassword());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.setAll(params);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
                Map<String, Object> responseBody = new HashMap<>(response.getBody());
                responseBody.put("user_id", user.getId());
                return ResponseEntity.ok(responseBody);
            } catch (HttpClientErrorException e) {
                return ResponseEntity.status(e.getStatusCode()).body(e.getResponseBodyAsString());
            }
        }
    }
}
