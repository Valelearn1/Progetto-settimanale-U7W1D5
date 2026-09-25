package it.epicode.base.errore;

/** 429: troppe richieste in poco tempo. Porta i secondi da attendere (header Retry-After). */
public class TroppiTentativiException extends RuntimeException {

	private final long secondiAttesa;

	public TroppiTentativiException(long secondiAttesa) {
		super("Troppi tentativi: riprova tra qualche minuto");
		this.secondiAttesa = secondiAttesa;
	}

	public long getSecondiAttesa() {
		return secondiAttesa;
	}
}
