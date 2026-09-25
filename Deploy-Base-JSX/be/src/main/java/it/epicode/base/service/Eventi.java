package it.epicode.base.service;

/**
 * Eventi pubblicati dai servizi e gestiti dopo il commit (NotificheListener):
 * la mail parte solo se i dati sono davvero salvati, e fuori dalla richiesta
 * HTTP, cosi' i tempi di risposta non rivelano nulla.
 */
public final class Eventi {

	private Eventi() {
	}

	/** Prezzo o stato di un annuncio cambiato: vanno controllati gli avvisi. */
	public record PrezzoCambiato(Long autoId) {
	}

	/** Richiesta di reset password per un utente esistente. */
	public record ResetRichiesto(Long utenteId, String token) {
	}
}
