import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Reaction, Reply, Review } from '../models/review.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8081/api/reviews';

  constructor(private http: HttpClient, private userService: UserService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(`Error: ${error.message}`);
    return throwError(() => new Error('Something went wrong with the request; please try again later.'));
  }

  addReview(productId: number, userId: number, review: Review): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${productId}/${userId}`, review, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getAverageRating(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${productId}/average-rating`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getReviewsByProductId(productId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  addReply(reviewId: number, userId: number, reply: Reply): Observable<Reply> {
    return this.http.post<Reply>(`${this.apiUrl}/${reviewId}/reply/${userId}`, reply, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  reactToReview(reviewId: number, userId: number, reaction: Reaction): Observable<Reaction> {
    return this.http.post<Reaction>(`${this.apiUrl}/${reviewId}/react/${userId}`, reaction, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  reactToReply(replyId: number, userId: number, reaction: Reaction): Observable<Reaction> {
    return this.http.post<Reaction>(`${this.apiUrl}/reply/${replyId}/react/${userId}`, reaction, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

  getRepliesByReviewId(reviewId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.apiUrl}/${reviewId}/replies`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}
