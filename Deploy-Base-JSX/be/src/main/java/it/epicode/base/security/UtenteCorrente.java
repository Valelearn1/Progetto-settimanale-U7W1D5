package it.epicode.base.security;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * L'id dell'utente collegato si legge solo dal JWT verificato, mai dal corpo
 * della richiesta o dall'indirizzo.
 */
public final class UtenteCorrente {

	private UtenteCorrente() {
	}

	public static Long id(Jwt jwt) {
		return Long.valueOf(jwt.getSubject());
	}
}
