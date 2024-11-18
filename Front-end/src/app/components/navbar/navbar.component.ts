import { Component, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';
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
  isMobileMenuOpen: boolean = false;
  userInfo: any = {};
  isDarkMode = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkAuthentication();
    this.initializeDarkMode();
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
    const returnUrl = this.router.url;
    this.router.navigate(['/auth/login'], { queryParams: { redirectUrl: returnUrl } });
  }
  logout() {  
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    this.isAuthenticated = false;
    this.userInfo = null;
    localStorage.clear();
    this.router.navigate(['/']);
  }


  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    if (
      this.dropdownWrapper &&
      !this.dropdownWrapper.nativeElement.contains(event.target) &&
      this.isDropdownOpen
    ) {
      this.isDropdownOpen = false;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
  openDropdown() {
    this.isDropdownOpen = true;
  }
  closeDropdown() {
    if (this.dropdownWrapper && !this.dropdownWrapper.nativeElement.contains(document.activeElement)) {
      this.isDropdownOpen = false;
    }
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
}
