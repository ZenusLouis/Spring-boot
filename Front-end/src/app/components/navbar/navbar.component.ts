import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  @ViewChild('dropdownWrapper') dropdownWrapper!: ElementRef;
  isAuthenticated: boolean = false;
  isDropdownOpen: boolean = false;
  userInfo: any = {};
  isDarkMode = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
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

  hasRole(role: string): boolean {
    return this.userInfo?.roles?.includes(role);
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  logout() {
    localStorage.removeItem('access_token');
    this.isAuthenticated = false;
    this.userInfo = null;
    this.router.navigate(['/']);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown() {
    if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(document.activeElement)) {
      this.isDropdownOpen = false;
    }
  }

  openDropdown() {
    this.isDropdownOpen = true;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark', this.isDarkMode);
  }
}
