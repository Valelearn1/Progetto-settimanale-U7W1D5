package it.epicode.base.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corpi delle richieste di autenticazione. Contengono solo i campi ammessi:
 * un "ruolo" o un "id" aggiunto al JSON non ha dove finire e viene ignorato.
 */
public final class AuthDto {

	private AuthDto() {
	}

	public record RegistrazioneRequest(
			@NotBlank @Size(max = 60) String nome,
			@NotBlank @Size(max = 60) String cognome,
			@NotBlank @Email @Size(max = 254) String email,
			// 72: oltre questa lunghezza BCrypt ignora i caratteri in piu'.
			@NotBlank @Size(min = 8, max = 72) String password) {
	}

	public record LoginRequest(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(max = 72) String password) {
	}

	public record TokenResponse(String token) {
	}

	public record PasswordDimenticataRequest(
			@NotBlank @Email @Size(max = 254) String email) {
	}

	public record ReimpostaPasswordRequest(
			@NotBlank @Size(max = 100) String token,
			@NotBlank @Size(min = 8, max = 72) String nuovaPassword) {
	}
}
