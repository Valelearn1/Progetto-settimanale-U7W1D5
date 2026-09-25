package it.epicode.base.errore;

/** 400 con un messaggio scritto da noi, mai con valori arrivati dal client. */
public class RichiestaNonValidaException extends RuntimeException {

	public RichiestaNonValidaException(String messaggio) {
		super(messaggio);
	}
}
