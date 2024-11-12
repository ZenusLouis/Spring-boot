import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  userInfo: any = null;
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  phone: string = '';
  address: string = '';
  isUpdating: boolean = false;
  selectedSection: string = 'profileInfo'; // Default section to show
  showModal: boolean = false;
  modalMessage: string = '';
  isSuccess: boolean = true;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const section = params.get('section');
      this.selectedSection = section === 'update' ? 'accountInfo' : 'profileInfo';
    });
    this.loadUserProfile();
  }

  loadUserProfile() {
    const userId = parseInt(localStorage.getItem('user_id') || '0', 10);
    if (userId) {
      this.userService.getUserDetails(userId).subscribe(
        (data) => {
          this.userInfo = data;
          this.email = this.userInfo.email || '';
          this.firstName = this.userInfo.firstName || '';
          this.lastName = this.userInfo.lastName || '';
          this.phone = this.userInfo.phone || '';
          this.address = this.userInfo.address || '';
        },
        (error) => {
          console.error('Error fetching user information', error);
        }
      );
    } else {
      console.error('User ID is missing in local storage.');
    }
  }

  updateUserProfile() {
    const userId = parseInt(localStorage.getItem('user_id') || '0', 10);
    if (userId) {
      this.isUpdating = true;
      const updatedData = {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        address: this.address,
      };
      this.userService.updateUserDetails(userId, updatedData).subscribe(
        () => {
          this.isUpdating = false;
          this.isSuccess = true;
          this.modalMessage = 'Profile updated successfully!';
          this.showModal = true;
          this.loadUserProfile();
        },
        (error) => {
          this.isUpdating = false;
          this.isSuccess = false;
          this.modalMessage = 'Failed to update profile. Please try again.';
          this.showModal = true;
          console.error('Error updating user profile', error);
        }
      );
    } else {
      console.error('User ID is missing in local storage.');
    }
  }

  selectSection(section: string) {
    this.selectedSection = section;
    this.router.navigate(['/profile', section === 'profileInfo' ? 'infor' : 'update']);
  }

  closeModal() {
    this.showModal = false;
  }
}