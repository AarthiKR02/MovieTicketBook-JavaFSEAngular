package movie.book.exception;

public class ErrorDetails {

	private long timestamp;
	private int status;
	private String error_desc;

	public ErrorDetails(long timestamp, int status, String error_desc) {
		super();
		this.timestamp = timestamp;
		this.status = status;
		this.error_desc = error_desc;
	}

	public long getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(long timestamp) {
		this.timestamp = timestamp;
	}

	public int getStatus() {
		return status;
	}

	public void setStatus(int status) {
		this.status = status;
	}

	public String getError_desc() {
		return error_desc;
	}

	public void setError_desc(String error_desc) {
		this.error_desc = error_desc;
	}
}
