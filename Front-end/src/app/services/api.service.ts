import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<any> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Register a new user
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/register`, userData, {
      headers,
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post<{ access_token: string, user_id: string }>(`${this.apiUrl}/auth/login`, credentials, { headers }).pipe(
      map(response => {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('user_id', response.user_id);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private clearAllCookies() {
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost:4200`;
    });
  }

  // Logout from Keycloak and clear session storage
  async logout(): Promise<void> {
    try {
      const logoutUrl = `http://localhost:8080/realms/myrealm/protocol/openid-connect/logout?redirect_uri=${window.location.origin}/home`;
      localStorage.removeItem('user_id');
      localStorage.removeItem('access_token');
      this.clearAllCookies();
      sessionStorage.clear();
      localStorage.clear();

      // Redirect to logout
      window.location.href = logoutUrl;
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Centralized error handling
  private handleError(error: any) {
    console.error('API call error:', error);
    return throwError(error);
  }
}
