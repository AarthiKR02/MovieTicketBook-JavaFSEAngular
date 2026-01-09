import { Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Movie } from '../model/Movie';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-movie',
  templateUrl: './search-movie.component.html',
  styleUrls: ['./search-movie.component.css']
})
export class SearchMovieComponent implements OnInit, OnDestroy {
  term = '';
  results: Movie[] = [];
  loading = false;
  error: string | null = null;
  searchAttempted = false;
  private input$ = new Subject<string>();

  @Output() searching = new EventEmitter<boolean>();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.input$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(t => this.search(t));
  }

  ngOnDestroy(): void {
    this.input$.complete();
  }

  onInput(value: string): void {
    this.term = value;
    this.input$.next(value);
  }

  onSubmit(): void {
    this.search(this.term);
  }

        search(term: string): void {
      const q = term.trim();
      this.searchAttempted = true;
    
      if (!q) {
        this.results = [];
        this.error = null;
        this.loading = false;
        this.searching.emit(false);
        return;
      }
    
      this.loading = true; // Set loading first!
      this.error = null;
      this.searching.emit(true);
    
      // Do NOT clear results here
    
      this.apiService.getMoviesByName(q).subscribe({
        next: (data) => {
          this.results = (data ?? []).filter(movie =>
            movie.name.toLowerCase().startsWith(q.toLowerCase())
          );
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = 'Failed to search movies. Please try again.';
          this.loading = false;
        }
      });
    }
  


  onBook(movie: Movie): void {
    console.log(`Booking initiated for: ${movie.name}`);
    // TODO: Router navigation or booking flow
  }
}