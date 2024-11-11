import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Fetch all categories with Authorization header
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  // Create a new category with Authorization header
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, category, { headers: this.getAuthHeaders() });
  }

  // Update an existing category with Authorization header
  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}/${category.cate_id}`, category, { headers: this.getAuthHeaders() });
  }

  // Delete a category with Authorization header
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Get a category by ID with Authorization header
  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
