import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) { }

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
    const headers = new HttpHeaders({ 'Content-Type': 'application/json',  });
    return this.http.post(`${this.apiUrl}/auth/register`, userData, { headers, responseType: 'text' }).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 409) {
                return throwError('Username already exists. Please choose a different one.');
            }
            return throwError('Registration failed. Please try again.');
        })
    );
}

  checkUsername(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/auth/users/check-username?username=${username}`).pipe(
      catchError(this.handleError.bind(this))
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

  requestChangePassword(data: { oldPassword: string; newPassword: string; confirmPassword: string; email: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/request-change-password`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  verifyOtpAndChangePassword(data: { email: string; otp: string; newPassword: string }): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/verify-otp`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email, headers }).pipe(
      catchError(this.handleError)
    );;
  }

  // Logout from Keycloak
  async logout(): Promise<void> {
    try {
      const logoutUrl = `http://localhost:8080/realms/myrealm/protocol/openid-connect/logout?redirect_uri=${window.location.origin}/home`;
      localStorage.removeItem('user_id');
      localStorage.removeItem('access_token');
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
