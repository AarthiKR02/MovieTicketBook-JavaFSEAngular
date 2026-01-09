import { Component, EventEmitter, Output } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Movie } from '../model/Movie';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent {
  name = '';
  totalTickets: number | null = null;
  theatreName = '';
  error: string | null = null;
  loading = false;
  success: string | null = null;

  @Output() added = new EventEmitter<Movie>();

  constructor(private apiService: ApiService) {}

    onSubmit() {
    // Manual validation to show error if fields are empty
    if (!this.name || !this.theatreName || !this.totalTickets || this.totalTickets < 1) {
      this.error = 'All fields are required and total tickets must be at least 1.';
      this.success = null;
      return;
    }
    this.error = null;
    this.success = null;
    this.loading = true;
    this.apiService.addMovie({
      name: this.name,
      totalTickets: this.totalTickets,
      theatreName: this.theatreName
    }).subscribe({
      next: (movie) => {
        this.added.emit(movie);
        this.success = `${movie.name} added successfully!`;
        this.name = '';
        this.totalTickets = null;
        this.theatreName = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to add movie.';
        this.loading = false;
      }
    });
  }
}