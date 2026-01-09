package movie.book.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class UpdateStatusRequest {


    @NotBlank
    private String status;

}
