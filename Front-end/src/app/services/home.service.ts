import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private baseUrl = 'http://localhost:8081/api/products';
  private imageUrl = 'http://localhost:8081/api/images';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getNewestProducts(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/newest`, { headers: this.getAuthHeaders() }).pipe(
      map(data =>
        data.map(item => ({
          pro_id: item.id,
          pro_name: item.name,
          pro_des: item.description,
          pro_price: item.price,
          pro_stock: item.stock,
          pro_status: item.status,
          category: item.category,
          pro_image: item.image
        }))
      ),
      catchError(error => {
        console.error("Error fetching newest products:", error);
        return of([]);
      })
    );
  }

  getImageBlobUrl(imageName: string): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.imageUrl}/${imageName}`, { headers, responseType: 'blob' })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        catchError(() => of(''))
      );
  }

  checkImageExists(imageName: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.imageUrl}/exist/${imageName}`, { headers: this.getAuthHeaders() });
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${productId}`, { headers: this.getAuthHeaders() });
  }

  getBestSellers(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/best-sellers`, { headers: this.getAuthHeaders() }).pipe(
      map(data =>
        data.map(item => ({
          pro_id: item.id,
          pro_name: item.name,
          pro_des: item.description,
          pro_price: item.price,
          pro_stock: item.stock,
          pro_status: item.status,
          category: item.category,
          pro_image: item.image
        }))
      ),
      catchError(error => {
        console.error("Error fetching best sellers:", error);  // Updated the error message
        return of([]);
      })
    );
  }
}
