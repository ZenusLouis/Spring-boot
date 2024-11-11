import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  userData = {
    username: '',
    password: '',
  };
  showSuccessModal = false;
  showErrorModal = false;
  successMessage = 'Registration successful! Redirecting to login...';
  errorMessage = 'Registration failed. Please try again.';
  countdown = 3;

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    this.apiService.register(this.userData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.showSuccessModal = true;
        this.showErrorModal = false;
        this.userData = { username: '', password: '' };
        this.countdown = 3;
  
        const interval = setInterval(() => {
          this.countdown -= 1;
          if (this.countdown === 0) {
            clearInterval(interval);
            this.showSuccessModal = false;
            this.router.navigate(['/auth/login']);
          }
        }, 1000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.showSuccessModal = false;
        this.showErrorModal = true;
        this.countdown = 5;
  
        const interval = setInterval(() => {
          this.countdown -= 1;
          if (this.countdown === 0) {
            clearInterval(interval);
            this.showErrorModal = false;
          }
        }, 1000);
      }
    });
  }
    
}
