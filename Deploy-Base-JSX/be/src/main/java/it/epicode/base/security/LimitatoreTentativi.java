package it.epicode.base.security;

import it.epicode.base.errore.TroppiTentativiException;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Limite di richieste a finestra fissa, in memoria: "al massimo N volte per
 * questa chiave in questo intervallo". Protegge login, reset password e
 * registrazione da tentativi a raffica e da invii di mail in massa.
 *
 * In memoria basta per una sola istanza (il piano free di Render); con piu'
 * istanze servirebbe un archivio condiviso (es. Redis).
 */
@Component
public class LimitatoreTentativi {

	private record Finestra(Instant inizio, int conteggio) {
	}

	private final Map<String, Finestra> finestre = new ConcurrentHashMap<>();
	private final Clock orologio;

	public LimitatoreTentativi() {
		this(Clock.systemUTC());
	}

	LimitatoreTentativi(Clock orologio) {
		this.orologio = orologio;
	}

	/** Registra un tentativo; oltre il limite lancia 429 con i secondi di attesa. */
	public void consuma(String chiave, int massimo, Duration finestra) {
		Instant adesso = orologio.instant();
		Finestra f = finestre.compute(chiave, (k, vecchia) ->
				vecchia == null || !adesso.isBefore(vecchia.inizio().plus(finestra))
						? new Finestra(adesso, 1)
						: new Finestra(vecchia.inizio(), vecchia.conteggio() + 1));
		if (f.conteggio() > massimo) {
			long attesa = Duration.between(adesso, f.inizio().plus(finestra)).toSeconds();
			throw new TroppiTentativiException(Math.max(1, attesa));
		}
		pulisciOgniTanto(adesso);
	}

	/** Controlla senza consumare (es. login gia' bloccato per quella email). */
	public void verifica(String chiave, int massimo, Duration finestra) {
		Finestra f = finestre.get(chiave);
		Instant adesso = orologio.instant();
		if (f != null && adesso.isBefore(f.inizio().plus(finestra)) && f.conteggio() >= massimo) {
			throw new TroppiTentativiException(Math.max(1, Duration.between(adesso, f.inizio().plus(finestra)).toSeconds()));
		}
	}

	/** Dopo un login riuscito gli errori precedenti non contano piu'. */
	public void azzera(String chiave) {
		finestre.remove(chiave);
	}

	private void pulisciOgniTanto(Instant adesso) {
		if (finestre.size() > 10_000) {
			finestre.entrySet().removeIf(e -> e.getValue().inizio().isBefore(adesso.minus(Duration.ofHours(2))));
		}
	}
}
