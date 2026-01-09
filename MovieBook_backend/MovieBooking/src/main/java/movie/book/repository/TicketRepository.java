package movie.book.repository;

import movie.book.model.Movie;
import movie.book.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    int countByMovie(Movie movie);

    List<Ticket> findAllByUser_Username(String username);
}
