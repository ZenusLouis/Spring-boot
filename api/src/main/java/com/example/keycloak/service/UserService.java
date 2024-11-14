package com.example.keycloak.service;

import com.example.keycloak.dto.ChangePasswordRequest;
import com.example.keycloak.dto.VerifyOtpRequest;
import com.example.keycloak.entity.User;
import com.example.keycloak.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService; // Service gửi email

    private Map<String, String> otpStorage = new HashMap<>();

    // Regular expression for phone number validation (10-15 digits)
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[0-9]{10,15}$");

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }else {
            validatePhone(user.getPhone());
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            return userRepository.save(user);
        }
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public Long getUserIdByUsername(String username) {
        return userRepository.findIdByUsername(username).orElse(null);
    }

    public User authenticateUser(String username, String rawPassword) {
        Optional<User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (passwordEncoder.matches(rawPassword, user.getPassword())) {
                return user;
            }
        }
        return null;
    }

    public List<User> findAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> updateUser(Long id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            if (userDetails.getUsername() != null && !userDetails.getUsername().isEmpty()) {
                user.setUsername(userDetails.getUsername());
            }
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            if (userDetails.getEmail() != null && !userDetails.getEmail().isEmpty()) {
                user.setEmail(userDetails.getEmail());
            }
            if (userDetails.getFirstName() != null && !userDetails.getFirstName().isEmpty()) {
                user.setFirstName(userDetails.getFirstName());
            }
            if (userDetails.getLastName() != null && !userDetails.getLastName().isEmpty()) {
                user.setLastName(userDetails.getLastName());
            }
            if (userDetails.getPhone() != null && !userDetails.getPhone().isEmpty()) {
                validatePhone(userDetails.getPhone());
                user.setPhone(userDetails.getPhone());
            }
            if (userDetails.getAddress() != null && !userDetails.getAddress().isEmpty()) {
                user.setAddress(userDetails.getAddress());
            }
            return userRepository.save(user);
        });
    }

    public boolean deleteUserById(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Validate phone number
    private void validatePhone(String phone) {
        if (phone != null && !PHONE_PATTERN.matcher(phone).matches()) {
            throw new IllegalArgumentException("Invalid phone number");
        }
    }

    public String requestChangePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("New password and confirm password do not match");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        otpStorage.put(user.getEmail(), otp);
        emailService.sendOtpEmail(user.getEmail(), otp);

        return "OTP has been sent to your email";
    }

    public String verifyOtpAndChangePassword(VerifyOtpRequest request) {
        String storedOtp = otpStorage.get(request.getEmail());
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        otpStorage.remove(request.getEmail());

        return "Password has been changed successfully";
    }

    public boolean isUsernameTaken(String username) {
        return userRepository.existsByUsername(username);
    }
}
