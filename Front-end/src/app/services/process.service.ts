import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {

  private baseUrl = 'http://localhost:8081/api/process';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  startProcess(orderAmount: number): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/start?orderAmount=${orderAmount}`, {}, { 
      headers: this.getHeaders(),
      responseType: 'text' as 'json' 
    });
  }

  getTasks(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tasks`, { 
      headers: this.getHeaders(), 
      responseType: 'json' 
    });
  }

  completeTask(taskId: string, variables: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tasks/${taskId}/complete`, variables, { 
      headers: this.getHeaders(), 
      responseType: 'json' 
    });
  }
}
