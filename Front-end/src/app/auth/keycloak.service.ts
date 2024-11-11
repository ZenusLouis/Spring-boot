import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class KeycloakAuthService {
  constructor(private keycloakService: KeycloakService) {}

  async initKeycloak() {
    try {
      await this.keycloakService.init({
        config: {
          url: 'http://localhost:8080',
          realm: 'myrealm', 
          clientId: 'demo',
        },
        initOptions: {
          onLoad: 'check-sso',
          checkLoginIframe: false,
        },
      });
    } catch (error) {
      console.error('Keycloak init failed', error);
    }
  }

  logout() {
    this.keycloakService.logout('http://localhost:4200');
  }
}
