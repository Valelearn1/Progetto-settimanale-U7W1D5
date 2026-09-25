package it.epicode.base.security;

import it.epicode.base.model.Utente;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

/**
 * Emette i JWT. Dentro ci sono solo l'id dell'utente (sub) e il ruolo:
 * niente email ne' nome, che il FE chiede a /api/me.
 */
@Service
public class JwtService {

	public static final String CLAIM_RUOLO = "ruolo";

	private final JwtEncoder encoder;
	private final Duration durata;

	public JwtService(JwtEncoder encoder, @Value("${app.jwt.durata}") Duration durata) {
		this.encoder = encoder;
		this.durata = durata;
	}

	public String emetti(Utente utente) {
		Instant adesso = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.subject(utente.getId().toString())
				.claim(CLAIM_RUOLO, utente.getRuolo().name())
				.issuedAt(adesso)
				.expiresAt(adesso.plus(durata))
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
		return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
	}
}
