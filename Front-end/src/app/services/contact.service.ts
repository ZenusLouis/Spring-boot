import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = 'http://localhost:8081/api/contact';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  sendMessage(email: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-email`, { email, message }, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json',
    });
  }

  getUserContacts(email: string): Observable<any[]> {
    const params = new HttpParams().set('email', email);
    return this.http.get<any[]>(`${this.apiUrl}/user-contacts`, {
      params,
      headers: this.getHeaders(),
      responseType: 'json'
    });
  }
  getAllContacts(page: number, size: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/all`, {
      params: { page: page.toString(), size: size.toString() },
      headers: this.getHeaders(),
      responseType: 'json',
    });
  }  
}
