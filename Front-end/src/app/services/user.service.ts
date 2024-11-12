import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userApiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {

  }

  getUserIdFromToken(): string {
    const token = localStorage.getItem('access_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    }
    return '';
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getUserDetails(userId: number): Observable<any> {
    return this.http.get(`${this.userApiUrl}/${userId}`, {
      headers: this.getHeaders(),
      responseType: 'json',
    });
  }

  updateUserDetails(userId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.userApiUrl}/${userId}`, updatedData, {
      headers: this.getHeaders(),
      responseType: 'json',
    });
  }
}