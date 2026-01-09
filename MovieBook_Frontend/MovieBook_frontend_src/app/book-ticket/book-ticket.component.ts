import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Ticket } from '../model/Ticket';
import { TicketBookingRequest } from '../model/TicketBookingRequest';
import { Movie } from '../model/Movie';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  label: string;
  status: SeatStatus;
}

@Component({
  selector: 'app-book-ticket',
  templateUrl: './book-ticket.component.html',
  styleUrls: ['./book-ticket.component.css']
})
export class BookTicketComponent implements OnInit {

  seats: Seat[] = Array.from({ length: 20 }, (_, i) => ({
    label: `A${i + 1}`,
    status: 'available'
  }));

  movieId: number | '' = '';
  movie?: Movie; // added: holds movie details fetched in ngOnInit
  loading = false;
  successMsg = '';
  errorMsg = '';

  get selectedSeats(): string[] {
    return this.seats.filter(s => s.status === 'selected').map(s => s.label);
  }

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // ...existing code that reads route param (if present) ...
    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('movieId');
    if (idParam) {
      const n = Number(idParam);
      if (!Number.isNaN(n)) {
        this.movieId = n;
        // fetch movie details
        this.api.getMovieById(n).subscribe({
          next: (m) => { this.movie = m; },
          error: () => { this.errorMsg = 'Failed to load movie details.'; }
        });
      }
    }
  }

  toggleSeat(seat: Seat) {
    if (seat.status === 'booked') return;
    seat.status = seat.status === 'selected' ? 'available' : 'selected';
    this.successMsg = '';
    this.errorMsg = '';
    console.log('seat toggled', seat.label, seat.status, 'selectedSeats=', this.selectedSeats);
  }

  confirmBooking() {
    // separate checks so user sees the correct error
    if (!this.movieId) {
      this.errorMsg = 'No movie selected. Please open booking from the movie list (book/:id).';
      return;
    }
    if (this.selectedSeats.length === 0) {
      this.errorMsg = 'Please select at least one seat.';
      return;
    }

    const payload: TicketBookingRequest = {
      movieId: Number(this.movieId),
      numberOfTickets: this.selectedSeats.length,
      seatNumber: this.selectedSeats
    };

    console.log('booking payload:', payload);

    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.api.bookTickets(payload).subscribe({
      next: (res: Ticket[] | any) => {
        console.log('booking success response:', res);

        // mark selected seats as booked locally
        this.seats.forEach(s => { if (s.status === 'selected') s.status = 'booked'; });

        // notify shared subject if present
        try { (this.api as any).myTickets?.next?.(Array.isArray(res) ? res : []); } catch {}

        // emit updated movie if returned
        try { if (res && res.id) (this.api as any).bookingUpdates?.next?.(res); } catch {}

        this.successMsg = 'Movie booked successfully.';
        this.loading = false;

        // navigate to MyTickets after short delay so user sees message
        setTimeout(() => this.router.navigate(['/my-tickets']), 600);
      },
      error: (err: any) => {
        console.error('booking error:', err);
        const serverMessage = err?.error?.message || err?.error || err?.message || null;
        this.errorMsg = serverMessage && typeof serverMessage === 'object' ? JSON.stringify(serverMessage) :
                        serverMessage || `Booking failed (status ${err?.status ?? 'unknown'})`;
        this.loading = false;
      }
    });
  }
}