import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TopProduct } from '../models/order.model';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api/dashboard';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`, { headers: this.getAuthHeaders() });
  }

  getCharts(viewType: string, month?: string, quarter?: string): Observable<any> {
    let params = new HttpParams().set('viewType', viewType);

    if (month) {
      params = params.set('month', month);
    }
    if (quarter) {
      params = params.set('quarter', quarter);
    }

    return this.http.get<any>(`${this.apiUrl}/chart`, {
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getTopProducts(): Observable<TopProduct[]> {
    return this.http.get<TopProduct[]>(`${this.apiUrl}/top-products`, {headers: this.getAuthHeaders(),});
  }
}
