import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8081/api/cart';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, { productId, quantity }, {
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: 'text'
    });
  }

  getCart(): Observable<any> {
    return this.http.get(`${this.apiUrl}/get`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  updateQuantity(productId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, { productId, quantity }, {
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: 'text'
    });
  }
  getProductDetails(productId: number): Observable<any> {
    return this.http.get(`http://localhost:8081/api/products/${productId}`, {
      headers: this.getHeaders()
    });
  }

  removeItem(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remove/${productId}`, {
      headers: this.getHeaders(),
      withCredentials: true,
      responseType: 'text'
    });
  }

  checkout(userId: number, phone: string, address: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout`, { userId, phone, address }, {
      headers: this.getHeaders(),
      responseType: 'text' as 'json',
      withCredentials: true
    });
  }
}
