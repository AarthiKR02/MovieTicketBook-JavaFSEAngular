import { Movie } from "./Movie";

export interface Ticket {
  id: number;
  movie: Movie;
  numberOfTickets: number;
  seatNumber: string[];
//   user: User;
}