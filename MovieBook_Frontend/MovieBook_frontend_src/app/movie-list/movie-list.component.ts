import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service'; // Fixed import path
import { Movie } from '../model/Movie';

@Component({
  selector: 'app-movie-list', // Fixed selector to match usage in HTML
  templateUrl: './movie-list.component.html', // Fixed template file name
  styleUrls: ['./movie-list.component.css']   // Fixed style file name
})
export class MovieListComponent implements OnInit { // Fixed class name to match selector and file
  movies: Movie[] = [];
  loading = false;
  error: string | null = null;

  bookingMovie: Movie | null = null;
  numberOfTickets: number = 1;
  seatNumber: string = '';
  bookingError: string | null = null;
  bookingSuccess: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchMovies();
  }

  addMovieToList(movie: Movie) {
    this.movies.unshift(movie); // Add to the top
  }

  fetchMovies(): void {
    // this.loading = true;
    this.error = null;

    this.apiService.getAllMovies().subscribe({
      next: (data) => {
        this.movies = data ?? [];
        // this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to load movies. Please try again.';
        // this.loading = false;
      }
    });
  }

  openBooking(movie: Movie) {
    this.bookingMovie = movie;
    this.numberOfTickets = 1;
    this.seatNumber = '';
    this.bookingError = null;
    this.bookingSuccess = null;
  }

  bookNow() {
    if (!this.bookingMovie) return;
    this.apiService.bookTickets({
      movieId: this.bookingMovie.id!,
      numberOfTickets: this.numberOfTickets,
      seatNumber: [this.seatNumber]
    }).subscribe({
      next: (tickets) => {
        this.bookingSuccess = 'Booking successful!';
        this.bookingError = null;
        this.bookingMovie = null;
        // Optionally refresh movies list here
      },
      error: (err) => {
        this.bookingError = 'Booking failed!';
      }
    });
  }

  cancelBooking() {
    this.bookingMovie = null;
  }
}