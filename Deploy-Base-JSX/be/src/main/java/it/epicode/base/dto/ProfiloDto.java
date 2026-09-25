package it.epicode.base.dto;

import it.epicode.base.model.Ruolo;
import it.epicode.base.model.Utente;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class ProfiloDto {

	private ProfiloDto() {
	}

	public record ProfiloResponse(Long id, String nome, String cognome, String email, Ruolo ruolo) {

		public static ProfiloResponse da(Utente u) {
			return new ProfiloResponse(u.getId(), u.getNome(), u.getCognome(), u.getEmail(), u.getRuolo());
		}
	}

	/** Solo nome e cognome sono modificabili: ruolo ed email restano fuori. */
	public record ProfiloUpdateRequest(
			@NotBlank @Size(max = 60) String nome,
			@NotBlank @Size(max = 60) String cognome) {
	}
}
