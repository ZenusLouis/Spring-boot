import { Component } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  userData = {
    username: '',
    password: '',
  };
  confirmPassword = '';
  showModal = false;
  modalType: 'success' | 'error' = 'success';
  modalMessage = '';
  countdown = 3;
  usernameTaken = false;

  constructor(private apiService: ApiService, private router: Router) {}

  onSubmit() {
    if (this.userData.password !== this.confirmPassword) {
      this.showModalWithMessage('error', 'Passwords do not match. Please check and try again.');
      return;
    }
  
    this.apiService.checkUsername(this.userData.username).subscribe({
      next: (isTaken) => {
        if (isTaken) {
          this.showModalWithMessage('error', 'Username is already taken. Please choose another one.');
        } else {
          this.apiService.register(this.userData).subscribe({
            next: () => {
              this.showModalWithMessage('success', 'Registration successful! Redirecting to login...');
              setTimeout(() => {
                this.router.navigate(['/auth/login']);
              }, this.countdown * 1000);
            },
            error: () => {
              this.showModalWithMessage('error', 'Registration failed. Please try again.');
            }
          });
        }
      },
      error: () => {
        this.showModalWithMessage('error', 'Error checking username. Please try again later.');
      }
    });
  }  

  private showModalWithMessage(type: 'success' | 'error', message: string) {
    this.modalType = type;
    this.modalMessage = message;
    this.showModal = true;
    this.countdown = 3;

    const interval = setInterval(() => {
      this.countdown -= 1;
      if (this.countdown === 0) {
        clearInterval(interval);
        this.showModal = false;
      }
    }, 1000);
  }
}
