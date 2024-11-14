package com.example.keycloak;

import org.keycloak.component.ComponentModel;
import org.keycloak.credential.CredentialInput;
import org.keycloak.credential.CredentialModel;
import org.keycloak.credential.CredentialInputValidator;
import org.keycloak.models.*;
import org.keycloak.storage.UserStorageProvider;
import org.keycloak.storage.adapter.AbstractUserAdapterFederatedStorage;
import org.keycloak.storage.user.UserLookupProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class CustomUserStorageProvider implements UserStorageProvider, UserLookupProvider, CredentialInputValidator {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserStorageProvider.class);
    private final KeycloakSession session;
    private final ComponentModel model;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public CustomUserStorageProvider(KeycloakSession session, ComponentModel model) {
        this.session = session;
        this.model = model;
    }

    @Override
    public UserModel getUserById(RealmModel realmModel, String id) {
        String[] parts = id.split(":");
        if (parts.length != 3) {
            logger.warn("Invalid userId format: {}", id);
            return null;
        }
        String username = parts[2];
        return getUserByUsername(realmModel, username);
    }

    @Override
    public UserModel getUserByUsername(RealmModel realmModel, String username) {
        return findUserInDatabase(username);
    }

    @Override
    public UserModel getUserByEmail(RealmModel realmModel, String email) {
        return findUserInDatabase(email);
    }

    private UserModel findUserInDatabase(String username) {
        if (username == null) {
            return null;
        }
        String sql = "SELECT * FROM users WHERE username = ?";

        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, username);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                String dbUsername = resultSet.getString("username");
                String dbEmail = resultSet.getString("email");
                String firstName = resultSet.getString("first_name");
                String lastName = resultSet.getString("last_name");

                return createUser(dbUsername, dbEmail, firstName, lastName);
            }
        } catch (SQLException e) {
            logger.error("Failed to query the user in the database", e);
        }
        return null;
    }

    private Connection getConnection() throws SQLException {
        String url = "jdbc:postgresql://localhost:5432/test";
        String username = "test";
        String password = "test";
        return DriverManager.getConnection(url, username, password);
    }

    private UserModel createUser(String username, String email, String firstName, String lastName) {
        return new AbstractUserAdapterFederatedStorage(session, session.getContext().getRealm(), model) {
            @Override
            public String getUsername() {
                return username;
            }

            @Override
            public void setUsername(String s) {
                // Không cần thiết vì username không thay đổi
            }

            @Override
            public String getEmail() {
                return email;
            }

            @Override
            public String getFirstName() {
                return firstName;
            }

            @Override
            public String getLastName() {
                return lastName;
            }

            @Override
            public boolean isEmailVerified() {
                return true;
            }
        };
    }

    @Override
    public boolean isValid(RealmModel realm, UserModel user, CredentialInput credentialInput) {
        if (!(credentialInput instanceof UserCredentialModel)) {
            return false;
        }

        UserCredentialModel credential = (UserCredentialModel) credentialInput;
        String username = user.getUsername();
        String storedPasswordHash = findPasswordForUser(username);

        if (storedPasswordHash == null) {
            return false;
        }

        boolean matches = passwordEncoder.matches(credential.getChallengeResponse(), storedPasswordHash);
        logger.info("Password matches for user {}: {}", username, matches);
        return matches;
    }

    private String findPasswordForUser(String username) {
        String sql = "SELECT password FROM users WHERE username = ?";
        try (Connection connection = getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, username);
            ResultSet resultSet = statement.executeQuery();

            if (resultSet.next()) {
                String passwordHash = resultSet.getString("password");
                logger.info("Retrieved password hash for user {}: {}", username, passwordHash);
                return passwordHash;
            }
        } catch (SQLException e) {
            logger.error("Failed to query the password for user: {}", username, e);
        }
        return null;
    }

    @Override
    public boolean supportsCredentialType(String credentialType) {
        return CredentialModel.PASSWORD.equals(credentialType);
    }

    @Override
    public boolean isConfiguredFor(RealmModel realm, UserModel user, String credentialType) {
        return supportsCredentialType(credentialType);
    }

    @Override
    public void close() {
        // Implement close logic if necessary
    }
}
