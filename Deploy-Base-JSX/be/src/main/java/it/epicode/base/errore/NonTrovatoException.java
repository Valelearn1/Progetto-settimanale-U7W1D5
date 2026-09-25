package it.epicode.base.errore;

/**
 * 404. Si usa anche quando la risorsa esiste ma e' di un altro utente: chi
 * chiede non deve nemmeno sapere che esiste.
 */
public class NonTrovatoException extends RuntimeException {

	public NonTrovatoException() {
		super("Risorsa non trovata");
	}
}
