
package movie.book.service;

import movie.book.exception.DetailsNotFoundException;
import movie.book.model.Movie;
import movie.book.model.Ticket;
import movie.book.repository.MovieRepository;
import movie.book.repository.TicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private TicketRepository ticketRepository;


    private static final Set<String> ALLOWED_STATUSES = new HashSet<>(Arrays.asList(
            "AVAILABLE", "BOOK ASAP", "SOLD OUT"
    ));


    @Transactional
    public List<Ticket> bookTicket(Long movieId, int numberOfTickets, List<String> seatNumbers) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(NoSuchElementException::new);

        if (numberOfTickets <= 0) {
            throw new DetailsNotFoundException("Number of tickets must be greater than zero");
        }
        if (seatNumbers == null || seatNumbers.size() != numberOfTickets) {
            throw new DetailsNotFoundException("Seat numbers count must match the number of tickets");
        }
        if (movie.getTotalTickets() <= 0 || movie.getTotalTickets() < numberOfTickets) {
            throw new DetailsNotFoundException("Not enough tickets available");
        }

        List<Ticket> tickets = new ArrayList<>();
        for (String seatNumber : seatNumbers) {
            Ticket ticket = new Ticket();
            ticket.setMovie(movie);
            ticket.setNumberOfTickets(1); // one seat per ticket
            ticket.setSeatNumber(seatNumber);
            tickets.add(ticketRepository.save(ticket));
        }

        // Decrement available tickets
        int remaining = movie.getTotalTickets() - numberOfTickets;
        movie.setTotalTickets(Math.max(0, remaining));

        // Recalculate status from business rules
        deriveAndSetStatus(movie);

        movieRepository.save(movie);
        return tickets;
    }

    @Transactional
    public void updateMovieStatus(Movie movie) {
        deriveAndSetStatus(movie);

        movieRepository.save(movie);
    }

    @Transactional
    public void updateStatus(Long id, String rawStatus) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));

        String status = normalizeStatus(rawStatus);  // <-- used here


        if (!ALLOWED_STATUSES.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unsupported status: " + rawStatus + ". Allowed: " + ALLOWED_STATUSES
            );
        }

        movie.setStatus(status);
        movieRepository.save(movie);
    }


    private String normalizeStatus(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }
        String trimmed = input.trim();
        // Map variants to canonical form
        if ("BOOK_ASAP".equalsIgnoreCase(trimmed) || "book asap".equalsIgnoreCase(trimmed)) {
            return "BOOK ASAP";
        }
        // Standardize other statuses
        return trimmed.toUpperCase(); // e.g., "available" -> "AVAILABLE"
    }


    private void deriveAndSetStatus(Movie movie) {
        int ticketsLeft = Math.max(0, movie.getTotalTickets());
        if (ticketsLeft <= 0) {
            movie.setStatus("SOLD OUT");
        } else if (ticketsLeft <= 10) {
            movie.setStatus("BOOK ASAP");
        } else {
            movie.setStatus("AVAILABLE");
        }
    }
}
