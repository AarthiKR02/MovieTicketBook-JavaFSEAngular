
// my-tickets.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiService } from '../services/api.service';
import { Ticket } from '../model/Ticket';

interface GroupedTicket {
  movieId: number;
  movieName: string;
  theatreName: string;
  seats: string[];       // unique seat numbers across tickets
  quantity: number;      // seats count
}

@Component({
  selector: 'app-my-tickets',
  templateUrl: './my-tickets.component.html',
  styleUrls: ['./my-tickets.component.css']
})
export class MyTicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];                // raw tickets if you still need them
  grouped: GroupedTicket[] = [];         // display model (one card per movie)
  loading = false;
  error: string | null = null;

  private subs = new Subscription();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private loadTickets(): void {
    this.loading = true;
    this.error = null;

    this.subs.add(
      this.api.getMyTickets().subscribe({
        next: (data) => {
          this.tickets = data ?? [];
          this.grouped = this.groupTicketsByMovie(this.tickets);
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load tickets.';
          this.loading = false;
        }
      })
    );
  }

  /** Groups raw tickets into one item per movie with seats[] and quantity */
  private groupTicketsByMovie(tickets: Ticket[]): GroupedTicket[] {
    const map = new Map<number, GroupedTicket>();

    tickets.forEach(t => {
      const movieId = t.movie?.id;
      if (movieId == null) return;

      const movieName = t.movie?.name ?? 'Unknown';
      const theatreName = t.movie?.theatreName ?? '—';

      // Initialize group
      if (!map.has(movieId)) {
        map.set(movieId, {
          movieId,
          movieName,
          theatreName,
          seats: [],
          quantity: 0
        });
      }

      const group = map.get(movieId)!;

      // Normalize seat(s) per ticket:
      // If seatNumber is an array, push all; if string, push as single seat.
      const seatsFromTicket: string[] = Array.isArray((t as any).seatNumber)
        ? ((t as any).seatNumber as string[]).filter(Boolean)
        : ((t.seatNumber ? [String(t.seatNumber)] : []));

      // Add seats, avoiding duplicates
      seatsFromTicket.forEach(s => {
        if (s && !group.seats.includes(s)) {
          group.seats.push(s);
        }
      });

      // Quantity: prefer numberOfTickets if present; otherwise use seatsFromTicket length or 1
      const units = (typeof t.numberOfTickets === 'number' && t.numberOfTickets > 0)
        ? t.numberOfTickets
        : (seatsFromTicket.length > 0 ? seatsFromTicket.length : 1);

      group.quantity += units;
    });

    // Sort groups by movie name (optional)
    return Array.from(map.values()).sort((a, b) => a.movieName.localeCompare(b.movieName));
  }
}
