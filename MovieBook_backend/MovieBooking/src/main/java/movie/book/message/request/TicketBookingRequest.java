package movie.book.message.request;


import lombok.Data;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

@Data
public class TicketBookingRequest {
    @NotNull
    private Long movieId;

    @Min(1)
    private int numberOfTickets;

    @NotNull
    @Size(min = 1, max = 20)
    private List<String> seatNumber;

    // getters and setters
    public Long getMovieId() { return movieId; }
    public void setMovieId(Long movieId) { this.movieId = movieId; }
    public int getNumberOfTickets() { return numberOfTickets; }
    public void setNumberOfTickets(int numberOfTickets) { this.numberOfTickets = numberOfTickets; }
    public List<String> getSeatNumber() { return seatNumber; }
    public void setSeatNumber(List<String> seatNumber) { this.seatNumber = seatNumber; }

}


