import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8081/api/products';
  private reportUrl = 'http://localhost:8081/api/reports/products';
  private imageUrl = 'http://localhost:8081/api/images';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl, { headers: this.getAuthHeaders() });
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

  addProduct(product: Product, file: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(product));
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<Product>(this.baseUrl, formData, { headers: this.getAuthHeaders() });
  }

  updateProduct(product: Product, file: File | null): Observable<Product> {
    const formData = new FormData();
    formData.append('product', JSON.stringify(product));
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<Product>(`${this.baseUrl}/${product.pro_id}`, formData, { headers: this.getAuthHeaders() });
  }


  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`, { headers: this.getAuthHeaders() });
  }

  // Export methods
  exportToPdf(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/pdf`, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  exportToExcel(): Observable<Blob> {
    return this.http.get(`${this.reportUrl}/excel`, { headers: this.getAuthHeaders(), responseType: 'blob' });
  }

  //Import methods
  importProducts(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/import`, formData, { headers: this.getAuthHeaders(), responseType: 'text' as 'json' });
  }
}
