import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { ApiService } from '../../services/api.service';
import { CommonModule, DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  userInfo: any;
  accessToken: string = '';

  constructor(
    private keycloakService: KeycloakService,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Get access token from keycloak
    this.keycloakService.getToken().then(token => {
      this.accessToken = token;

      // Call API to get user info
      this.apiService.getUserProfile().subscribe(
        (data) => {
          this.userInfo = data;
          console.log('User info from API', this.userInfo);
        },
        (error) => {
          console.error('Error fetching user info from API', error);
        }
      );
    });
  }

  getRelativeLogoutTime(logoutTime: string | null): string {
    console.log('Logout time received:', logoutTime);  // Kiểm tra giá trị của logoutTime

    if (!logoutTime) {
      return 'Still Logged In';
    }

    try {
      const now = moment.default();
      const logoutMoment = moment.default(logoutTime);
      console.log('Current time:', now.format());
      console.log('Logout moment:', logoutMoment.format());
      return logoutMoment.from(now);
    } catch (error) {
      console.error('Error processing logout time:', error);
      return 'Invalid logout time';
    }
  }

}
