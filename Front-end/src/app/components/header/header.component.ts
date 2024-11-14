import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class HeaderComponent {
  isDarkMode = false;
  isDropdownOpen = false;
  isAuthenticated: boolean = false;
  userInfo: any;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDarkMode();
    this.checkAuthentication();
  }

  async checkAuthentication() {
    this.isAuthenticated = !!localStorage.getItem('access_token');
    if (this.isAuthenticated) {
      this.getUserProfile();
    }
  }

  getUserProfile() {
    this.apiService.getUserProfile().subscribe({
      next: (profile) => {
        this.userInfo = profile;
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
  }

  initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = savedDarkMode ? JSON.parse(savedDarkMode) : false;
    document.documentElement.classList.toggle('dark', this.isDarkMode);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isAuthenticated = false;
    this.userInfo = null;
    this.router.navigate(['/auth/login']);
  }
}
