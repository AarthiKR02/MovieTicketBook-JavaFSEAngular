package movie.book.dto;

import lombok.Data;

@Data
public class MovieRequest {
    private String name;
    private int totalTickets;
    private String theatreName;


}