import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  loginError = false;
  showModal = false;
  countdown = 2;
  countdownInterval: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  onSubmit() {
    this.apiService.login(this.credentials).subscribe({
      next: (response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.router.navigate(['/home']);
        }
      },
      error: (error) => {
        if (
          error.error.error === 'invalid_grant' &&
          error.error.error_description === 'Account is not fully set up'
        ) {
          this.showModal = true;
          this.startCountdown();
        } else {
          this.loginError = true;
          console.error('Login error:', error);
        }
      },
    });
  }

  startCountdown() {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval);
        this.redirectToProfileVerification();
      }
    }, 1000);
  }

  redirectToProfileVerification() {
    this.showModal = false;
    this.keycloakService.login({
      redirectUri: window.location.origin + '/home',
      idpHint: 'VERIFY_PROFILE'
    });
  }

  closeModal() {
    this.showModal = false;
    clearInterval(this.countdownInterval);
  }
}
