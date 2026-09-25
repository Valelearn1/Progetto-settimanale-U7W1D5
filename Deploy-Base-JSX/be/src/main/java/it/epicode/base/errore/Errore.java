package it.epicode.base.errore;

import java.util.List;

/** Corpo JSON di ogni risposta di errore. */
public record Errore(int stato, String messaggio, List<String> dettagli) {

	public Errore(int stato, String messaggio) {
		this(stato, messaggio, List.of());
	}
}
