package movie.book.model;

import java.util.List;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;

@Entity
@Data
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int totalTickets;
    private String status;

    @OneToMany(mappedBy = "movie")
    @JsonIgnore
    private List<Ticket> tickets;

    private String theatreName;


}

