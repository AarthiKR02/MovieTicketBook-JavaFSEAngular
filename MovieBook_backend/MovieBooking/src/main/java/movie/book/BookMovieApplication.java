package movie.book;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookMovieApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookMovieApplication.class, args);
        System.out.println("Application is running...");
    }
}
