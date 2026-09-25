package it.epicode.base.errore;

/** 409: la risorsa esiste gia' (email registrata, preferito gia' presente...). */
public class ConflittoException extends RuntimeException {

	public ConflittoException(String messaggio) {
		super(messaggio);
	}
}
