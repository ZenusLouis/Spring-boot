import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  getUserIdFromToken(): string {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    }
    return '';
  }
}