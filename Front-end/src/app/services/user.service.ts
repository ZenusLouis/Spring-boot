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

  getUsers(page: number = 0, size: number = 10): Observable<any> {
    return this.http.get(`${this.userApiUrl}?page=${page}&size=${size}`, {
      headers: this.getHeaders(),
      responseType: 'json',
    });
  }  

  getTotalUsers(): Observable<number> {
    return this.http.get<number>(`${this.userApiUrl}/count`, { headers: this.getHeaders() });
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