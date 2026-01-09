package movie.book.model;

import movie.book.model.user.User;
import lombok.Data;

import javax.persistence.*;


@Entity
@Data
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "movie_id")
    private Movie movie;


    private int numberOfTickets;
    private String seatNumber;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}

