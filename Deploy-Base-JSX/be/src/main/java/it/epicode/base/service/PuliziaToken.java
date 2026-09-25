package it.epicode.base.service;

import it.epicode.base.repository.TokenPasswordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/** Ogni notte cancella i token di reset password gia' usati o scaduti. */
@Component
public class PuliziaToken {

	private static final Logger log = LoggerFactory.getLogger(PuliziaToken.class);

	private final TokenPasswordRepository tokenPassword;

	public PuliziaToken(TokenPasswordRepository tokenPassword) {
		this.tokenPassword = tokenPassword;
	}

	@Scheduled(cron = "0 30 3 * * *", zone = "Europe/Rome")
	@Transactional
	public void pulisci() {
		int cancellati = tokenPassword.cancellaInutili(Instant.now());
		if (cancellati > 0) {
			log.info("[pulizia] cancellati {} token di reset password non piu' validi", cancellati);
		}
	}
}
