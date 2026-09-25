package it.epicode.base.errore;

/** 401 al login. Stesso messaggio per email sconosciuta e password sbagliata. */
public class CredenzialiNonValideException extends RuntimeException {

	public CredenzialiNonValideException() {
		super("Credenziali non valide");
	}
}
