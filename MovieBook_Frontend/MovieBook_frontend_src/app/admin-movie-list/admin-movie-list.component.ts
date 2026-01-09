
// src/app/admin-movie-list/admin-movie-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Movie } from '../model/Movie';

@Component({
  selector: 'app-admin-movie-list',
  templateUrl: './admin-movie-list.component.html',
  styleUrls: ['./admin-movie-list.component.css']
})
export class AdminMovieListComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  loading = false;
  error: string | null = null;

  savingIds = new Set<number>();
  refreshingIds = new Set<number>();
  private subs = new Subscription();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchMovies();

    // If you keep bookingUpdates, optionally refresh booked count
    this.subs.add(
      this.apiService.bookingUpdates.subscribe((updatedMovie) => {
        const idx = this.movies.findIndex(m => m.id === updatedMovie.id);
        if (idx >= 0) {
          this.movies[idx] = { ...this.movies[idx], ...updatedMovie };
          // Refresh booked count for that movie
          const id = updatedMovie.id;
          if (id != null) {
            this.apiService.getBookedCount(id).subscribe({
              next: (count) => this.movies[idx].bookedTickets = count,
              error: () => this.movies[idx].bookedTickets = this.movies[idx].bookedTickets ?? 0
            });
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  fetchMovies(): void {
    this.loading = true;
    this.error = null;
    this.apiService.getAllMovies().subscribe({
      next: (data) => {
        this.movies = (data ?? []).map(m => ({ ...m }));
        this.loading = false;

        // 🔢 Load booked count for each movie
        this.movies.forEach((movie, i) => {
          if (movie.id != null) {
            this.apiService.getBookedCount(movie.id).subscribe({
              next: (count) => this.movies[i].bookedTickets = count,
              error: () => this.movies[i].bookedTickets = 0 // fallback if endpoint not available yet
            });
          } else {
            this.movies[i].bookedTickets = 0;
          }
        });
      },
      error: () => {
        this.error = 'Failed to load movies.';
        this.loading = false;
      }
    });
  }

  markBookAsap(movie: Movie): void {
    this.updateStatus(movie, 'BOOK ASAP');
  }

  markSoldOut(movie: Movie): void {
    this.updateStatus(movie, 'SOLD OUT');
  }

  updateStatus(movie: Movie, status: string): void {
    if (movie.id == null) {
      this.error = 'Movie ID is missing.';
      return;
    }
    const id = movie.id;

    const token = (status ?? '').trim().toUpperCase().replace(/\s+/g, ' ');
    let backendStatus: string;
    switch (token) {
      case 'BOOK ASAP':
      case 'BOOK_ASAP':
      case 'ASAP':
        backendStatus = 'BOOK ASAP';
        break;
      case 'SOLD OUT':
      case 'SOLD_OUT':
      case 'SOLDOUT':
        backendStatus = 'SOLD OUT';
        break;
      default:
        backendStatus = token; // e.g., AVAILABLE, CONFIRMED, PENDING
    }

    const previous = movie.status;
    movie.status = backendStatus;
    this.savingIds.add(id);

    this.apiService.updateStatus(id, backendStatus).subscribe({
      next: () => {
        this.savingIds.delete(id);
      },
      error: () => {
        movie.status = previous;
        this.savingIds.delete(id);
        this.error = 'Failed to update status.';
      }
    });
  }

  refreshAvailability(movie: Movie): void {
    if (movie.id == null) {
      this.error = 'Movie ID is missing.';
      return;
    }
    const id = movie.id;

    this.refreshingIds.add(id);

    this.apiService.refreshMovieAvailability(id).subscribe({
      next: (updated) => {
        movie.totalTickets = updated.totalTickets;
        movie.status = updated.status;
        this.refreshingIds.delete(id);

        // 🔢 Optionally refresh booked count here too
        this.apiService.getBookedCount(id).subscribe({
          next: (count) => movie.bookedTickets = count,
          error: () => movie.bookedTickets = movie.bookedTickets ?? 0
        });
      },
      error: () => {
        this.refreshingIds.delete(id);
        this.error = 'Failed to refresh availability.';
      }
    });
  }

  deleteMovie(movie: Movie): void {
    if (movie.id == null) {
      this.error = 'Movie ID is missing.';
      return;
    }
    const id = movie.id;

    this.apiService.deleteMovie(id).subscribe({
      next: () => {
        this.movies = this.movies.filter(m => m.id !== id);
      },
      error: () => {
        this.error = 'Failed to delete movie.';
      }
    });
  }
}
