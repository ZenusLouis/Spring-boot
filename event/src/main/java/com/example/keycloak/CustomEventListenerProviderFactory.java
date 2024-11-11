package com.example.keycloak;

import org.keycloak.models.KeycloakSession;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventListenerProviderFactory;
import org.keycloak.component.ComponentModel;
import org.keycloak.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CustomEventListenerProviderFactory implements EventListenerProviderFactory {

    private static final Logger logger = LoggerFactory.getLogger(CustomEventListenerProviderFactory.class);

    @Override
    public EventListenerProvider create(KeycloakSession session) {
        return new CustomEventListener(session);
    }

    @Override
    public void init(Config.Scope config) {
        // Initialization if necessary
    }

    @Override
    public void postInit(org.keycloak.models.KeycloakSessionFactory factory) {
        // Post initialization if necessary
    }

    @Override
    public void close() {
        // Cleanup resources if necessary
    }

    @Override
    public String getId() {
        return "custom-event-listener";
    }
}
