
// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Movie } from '../model/Movie';
import { Ticket } from '../model/Ticket';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api/movies';

  constructor(private http: HttpClient) {}

  // Emits updates when a movie is changed due to bookings elsewhere
  bookingUpdates = new Subject<Movie>();

  // Holds the current user's tickets
  myTickets = new BehaviorSubject<Ticket[]>([]);

  // Get all movies
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/all`);
  }

  // Get a single movie by id
  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.baseUrl}/${id}`);
  }

  // Search movies by name
  getMoviesByName(term: string): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.baseUrl}/all/byName/${term}`);
  }

  // Add a movie (admin)
  addMovie(movieRequest: { name: string; totalTickets: number; theatreName: string }): Observable<Movie> {
    return this.http.post<Movie>(`${this.baseUrl}/add`, movieRequest);
  }

  // Recompute availability/status on backend using business rules
  refreshMovieAvailability(movieId: number): Observable<Movie> {
    return this.http.put<Movie>(`${this.baseUrl}/${movieId}/update-status`, {});
  }

  // Delete a movie (admin)
  deleteMovie(movieId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${movieId}`);
  }

  // Book tickets
  bookTickets(request: { movieId: number; numberOfTickets: number; seatNumber: string[] }): Observable<Ticket[]> {
    return this.http.post<Ticket[]>(`${this.baseUrl}/book`, request);
  }

  // Get tickets for the logged-in user (fix: route matches controller)
  getMyTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/my_tickets`);
  }

  // Manual status update (PATCH returns 204 No Content → void)
  updateStatus(id: number, status: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/status`, { status });
  }

  
// src/app/services/api.service.ts
getBookedCount(movieId: number): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/${movieId}/booked-count`);
}

}
