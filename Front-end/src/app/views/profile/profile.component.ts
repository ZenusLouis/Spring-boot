import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { ApiService } from '../../services/api.service';
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
  selectedSection: string = 'profileInfo';
  showModal: boolean = false;
  modalMessage: string = '';
  isSuccess: boolean = true;

  // Variables for change password
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  otp: string = '';
  otpSent: boolean = false;

  constructor(
    private userService: UserService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const section = params.get('section');
      this.selectedSection = section === 'update' ? 'accountInfo' : section === 'changePassword' ? 'changePassword' : 'profileInfo';
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

  // Request to change password
  requestChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.modalMessage = 'New password and confirm password do not match.';
      this.isSuccess = false;
      this.showModal = true;
      return;
    }

    const requestData = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
      email: this.userInfo.email
    };

    this.apiService.requestChangePassword(requestData).subscribe({
      next: () => {
        this.otpSent = true;  // Hiển thị form nhập OTP
        this.modalMessage = 'OTP has been sent to your email.';
        this.isSuccess = true;
        this.showModal = true;
      },
      error: (error) => {
        this.modalMessage = 'Failed to request password change. Please try again.';
        this.isSuccess = false;
        this.showModal = true;
        console.error('Error requesting password change', error);
      }
    });
  }

  // Verify OTP and change password
  // ProfileComponent
  verifyOtp() {
    const otpData = {
      email: this.userInfo.email,
      otp: this.otp,
      newPassword: this.newPassword  // Gửi mật khẩu mới cùng với OTP
    };

    this.apiService.verifyOtpAndChangePassword(otpData).subscribe({
      next: () => {
        this.modalMessage = 'Password changed successfully!';
        this.isSuccess = true;
        this.showModal = true;
        this.resetPasswordFields();
      },
      error: (error) => {
        this.modalMessage = 'Failed to verify OTP or change password.';
        this.isSuccess = false;
        this.showModal = true;
        console.error('Error verifying OTP or changing password', error);
      }
    });
  }

  // Reset password fields after success
  resetPasswordFields() {
    this.oldPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.otp = '';
    this.otpSent = false;
  }

  selectSection(section: string) {
    this.selectedSection = section;
    this.router.navigate(['/profile', section === 'profileInfo' ? 'infor' : section === 'accountInfo' ? 'update' : 'changePassword']);
  }

  closeModal() {
    this.showModal = false;
  }
}
