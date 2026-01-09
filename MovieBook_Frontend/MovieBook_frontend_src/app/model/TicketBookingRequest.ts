
export interface TicketBookingRequest {
    movieId: number;
    numberOfTickets: number;
    seatNumber: string[];  // list of seat codes
  }
