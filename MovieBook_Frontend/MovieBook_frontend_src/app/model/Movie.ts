import { Ticket } from "./Ticket";


export interface Movie {
  id: number;
  name: string;
  theatreName?: string;
  totalTickets?: number;
  status?: string;
  tickets?: { id?: number; movieId?: number; seatCode?: string; createdAt?: string }[];
  numberOfTickets?: number; // computed on client (or returned by API)

  bookedTickets?: number;
}
