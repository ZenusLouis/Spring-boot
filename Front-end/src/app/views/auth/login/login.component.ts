import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
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
  redirectUrl: string | null = null;
  isLoading = false;
  showErrorModal = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private keycloakService: KeycloakService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.redirectUrl = params['redirectUrl'] || '/home';
    });
  }

  onSubmit() {
    this.isLoading = true;
  
    this.apiService.login(this.credentials).subscribe({
      next: (response: any) => {
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
          this.router.navigateByUrl(this.redirectUrl!);
        }
      },
      error: (error) => {
        this.isLoading = false;
        if (
          error.error.error === 'invalid_grant' &&
          error.error.error_description === 'Account is not fully set up'
        ) {
          this.showModal = true;
          this.startCountdown();
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid username or password. Please try again.';
          this.showErrorModal = true;
        } else if (error.status === 500) {
          this.errorMessage = 'Internal server error. Please try again later.';
          this.showErrorModal = true;
        } else {
          this.errorMessage = `Unexpected error: ${error.error?.message || 'Unknown error'}`;
          this.showErrorModal = true;
        }
        console.error('Login error:', error);
      },
    });
  }
  
  closeErrorModal() {
    this.showErrorModal = false;
    this.errorMessage = '';
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

  goToKeycloakForgotPassword() {
    const keycloakForgotPasswordUrl = 'http://localhost:8080/realms/myrealm/login-actions/reset-credentials';
    window.location.href = keycloakForgotPasswordUrl;
  }
}
