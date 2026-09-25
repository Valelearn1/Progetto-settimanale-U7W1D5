package it.epicode.base.security;

import it.epicode.base.repository.UtenteRepository;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;

/**
 * Oltre a firma e scadenza, un JWT vale solo se:
 * - l'utente esiste ancora;
 * - e' stato emesso dopo l'ultimo cambio di password.
 * Cosi' reimpostare la password chiude subito le sessioni aperte altrove.
 */
public class ValidatoreUtenteJwt implements OAuth2TokenValidator<Jwt> {

	private static final OAuth2TokenValidatorResult NON_VALIDO =
			OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Sessione non piu' valida", null));

	private final UtenteRepository utenti;

	public ValidatoreUtenteJwt(UtenteRepository utenti) {
		this.utenti = utenti;
	}

	@Override
	public OAuth2TokenValidatorResult validate(Jwt jwt) {
		Long id;
		try {
			id = Long.valueOf(jwt.getSubject());
		} catch (NumberFormatException e) {
			return NON_VALIDO;
		}
		return utenti.findById(id)
				.map(u -> {
					Instant cambio = u.getCredenzialiAggiornateIl();
					Instant emesso = jwt.getIssuedAt();
					boolean vecchio = cambio != null && (emesso == null || emesso.isBefore(cambio));
					return vecchio ? NON_VALIDO : OAuth2TokenValidatorResult.success();
				})
				.orElse(NON_VALIDO);
	}
}
