package com.example.keycloak;

import org.keycloak.models.KeycloakSession;
import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.events.admin.OperationType;
import org.keycloak.events.admin.ResourceType;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.*;

public class CustomEventListener implements EventListenerProvider {

    private static final Logger logger = LoggerFactory.getLogger(CustomEventListener.class);
    private final KeycloakSession session;

    public CustomEventListener(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public void onEvent(Event event) {
        logger.info("received event: " + event.getType());
        if (event.getType() == EventType.UPDATE_PROFILE) {
            String userId = event.getUserId();
            logger.info("User profile updated for userId: {}", userId);
            syncUserProfileWithDatabaseByUserId(userId);
        }
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean includeRepresentation) {
        if (adminEvent.getOperationType() == OperationType.UPDATE && adminEvent.getResourceType() == ResourceType.USER) {
            String userId = adminEvent.getResourcePath().replace("users/", "");
            logger.info("User profile updated through admin console for userId: {}", userId);
            syncUserProfileWithDatabaseByUserId(userId);
        }
    }

    private void syncUserProfileWithDatabaseByUserId(String userId) {
        // Lấy realm và người dùng từ phiên Keycloak
        RealmModel realm = session.getContext().getRealm();
        UserModel user = session.users().getUserById(realm, userId);

        if (user != null) {
            if (user != null) {
                String username = user.getUsername();
                String email = user.getEmail() != null ? user.getEmail() : user.getFirstAttribute("email");
                String firstName = user.getFirstName() != null ? user.getFirstName() : user.getFirstAttribute("firstName");
                String lastName = user.getLastName() != null ? user.getLastName() : user.getFirstAttribute("lastName");

                logger.info("Synchronizing user to database: {} - {}, {}, {}", username, email, firstName, lastName);
                updateUserInDatabase(username, email, firstName, lastName);
            } else {
                logger.warn("User not found in Keycloak with ID: {}", userId);
            }

        }
    }

    private void updateUserInDatabase(String username, String email, String firstName, String lastName) {
        String url = "jdbc:postgresql://localhost:5432/test";
        String dbUsername = "test";
        String dbPassword = "test";

        String selectSql = "SELECT email, first_name, last_name FROM users WHERE username = ?";
        String updateSql = "UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE username = ?";

        try (Connection connection = DriverManager.getConnection(url, dbUsername, dbPassword);
             PreparedStatement selectStmt = connection.prepareStatement(selectSql);
             PreparedStatement updateStmt = connection.prepareStatement(updateSql)) {

            // Lấy dữ liệu hiện tại từ cơ sở dữ liệu
            selectStmt.setString(1, username);
            ResultSet rs = selectStmt.executeQuery();

            if (rs.next()) {
                String currentEmail = rs.getString("email");
                String currentFirstName = rs.getString("first_name");
                String currentLastName = rs.getString("last_name");

                logger.info("Current database values - Email: {}, FirstName: {}, LastName: {}", currentEmail, currentFirstName, currentLastName);
                logger.info("Keycloak values - Email: {}, FirstName: {}, LastName: {}", email, firstName, lastName);

                // Chỉ cập nhật nếu có sự thay đổi
                if (!email.equals(currentEmail) || !firstName.equals(currentFirstName) || !lastName.equals(currentLastName)) {
                    updateStmt.setString(1, email);
                    updateStmt.setString(2, firstName);
                    updateStmt.setString(3, lastName);
                    updateStmt.setString(4, username);

                    int rowsAffected = updateStmt.executeUpdate();
                    if (rowsAffected > 0) {
                        logger.info("User information updated in the database for username={}", username);
                    } else {
                        logger.warn("No user found in the database with username={}", username);
                    }
                } else {
                    logger.info("No changes detected for user {}, skipping update.", username);
                }
            } else {
                logger.warn("No user found in the database with username={}", username);
            }
        } catch (SQLException e) {
            logger.error("Failed to update user in the database", e);
        }
    }


    @Override
    public void close() {
    }
}
