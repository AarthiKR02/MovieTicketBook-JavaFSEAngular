
package movie.book.controller;

import movie.book.dto.MovieRequest;
import movie.book.dto.UpdateStatusRequest;
import movie.book.exception.DetailsNotFoundException;
import movie.book.exception.UsernameNotFoundException;
import movie.book.message.request.TicketBookingRequest;
import movie.book.model.Movie;
import movie.book.model.Ticket;
import movie.book.model.user.User;
import movie.book.repository.MovieRepository;
import movie.book.repository.TicketRepository;
import movie.book.repository.user.UserRepository;
import movie.book.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/api/movies")
@CrossOrigin(origins = "*")
public class MovieController {

    private final MovieService movieService;
    private final MovieRepository movieRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    @Autowired
    public MovieController(MovieService movieService,
                           MovieRepository movieRepository,
                           TicketRepository ticketRepository,
                           UserRepository userRepository) {
        this.movieService = movieService;
        this.movieRepository = movieRepository;
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
    }


    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Movie> getAll() {
        return movieRepository.findAll();
    }


    @GetMapping("/{movieId}")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public Movie getMovieById(@PathVariable Long movieId) {
        return movieRepository.findById(movieId)
                .orElseThrow(() -> new DetailsNotFoundException("Movie not found with id: " + movieId));
    }


    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @GetMapping(value = "/all/byName/{term}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Movie> getAllByName(@PathVariable String term) {
        List<Movie> movielist = movieRepository.findAllByNameContainingIgnoreCase(term);
        if (movielist.isEmpty()) {
            throw new DetailsNotFoundException("Movie with the term " + term + " Not Found");
        }
        return movielist;
    }

    @PostMapping("/book")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    @Transactional
    public List<Ticket> bookTicket(@Valid @RequestBody TicketBookingRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new DetailsNotFoundException("Movie not found with id: " + request.getMovieId()));

        int requested = request.getNumberOfTickets();
        if (requested <= 0) {
            throw new IllegalArgumentException("Number of tickets must be greater than zero");
        }
        if (request.getSeatNumber() == null || request.getSeatNumber().size() != requested) {
            throw new IllegalArgumentException("Seat numbers count must match the number of tickets");
        }
        if (movie.getTotalTickets() < requested) {
            throw new IllegalArgumentException("Not enough tickets available");
        }

        List<Ticket> tickets = new ArrayList<>();
        for (int i = 0; i < requested; i++) {
            Ticket ticket = new Ticket();
            ticket.setMovie(movie);
            ticket.setUser(user);
            ticket.setSeatNumber(request.getSeatNumber().get(i));
            tickets.add(ticketRepository.save(ticket));
        }

        // Decrement total tickets and recompute status
        movie.setTotalTickets(Math.max(0, movie.getTotalTickets() - requested));
        movieService.updateMovieStatus(movie);
        movieRepository.save(movie);

        return tickets;
    }


    @GetMapping("/my_tickets")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public List<Ticket> getMyTickets() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketRepository.findAllByUser_Username(username);
    }


    @PostMapping("/add")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Movie addMovie(@Valid @RequestBody MovieRequest movieRequest) {
        Movie movie = new Movie();
        movie.setName(movieRequest.getName());
        movie.setTotalTickets(movieRequest.getTotalTickets());
        movie.setStatus("Available");
        movie.setTheatreName(movieRequest.getTheatreName());
        return movieRepository.save(movie);
    }


    @PutMapping("/{movieId}/update-status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Movie updateMovieStatus(@PathVariable Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new DetailsNotFoundException("Movie not found with id: " + movieId));
        movieService.updateMovieStatus(movie);
        return movieRepository.save(movie);
    }


    @DeleteMapping("/{movieId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public void deleteMovie(@PathVariable Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new DetailsNotFoundException("Movie not found with id: " + movieId));
        movieRepository.delete(movie);
    }


    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')") // adjust if only ADMIN should change status
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request) {
        movieService.updateStatus(id, request.getStatus());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{movieId}/booked-count")
    @PreAuthorize("hasAnyAuthority('USER', 'ADMIN')")
    public ResponseEntity<Integer> getBookedCount(@PathVariable Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new DetailsNotFoundException("Movie not found with id: " + movieId));
        int count = ticketRepository.countByMovie(movie);
        return ResponseEntity.ok(count);
    }


}
