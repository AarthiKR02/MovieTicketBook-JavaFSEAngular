package movie.book.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
 
@ControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler
	public ResponseEntity<ErrorDetails> handleBookings(DetailsNotFoundException dnf){
		ErrorDetails err=new ErrorDetails(System.currentTimeMillis(),HttpStatus.NOT_FOUND.value(),dnf.getMessage());
		return new ResponseEntity<>(err,HttpStatus.NOT_FOUND);}
	
	@ExceptionHandler
	public ResponseEntity<ErrorDetails> handleBookings(UsernameNotFoundException dnf){
		ErrorDetails err=new ErrorDetails(System.currentTimeMillis(),HttpStatus.NOT_FOUND.value(),dnf.getMessage());
		return new ResponseEntity<>(err,HttpStatus.NOT_FOUND);}
 
}