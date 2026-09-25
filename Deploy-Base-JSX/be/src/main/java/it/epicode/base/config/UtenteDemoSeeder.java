package it.epicode.base.config;

import it.epicode.base.model.Ruolo;
import it.epicode.base.model.Utente;
import it.epicode.base.repository.UtenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;

/**
 * Utente normale di prova (ruolo USER), creato all'avvio solo se DEMO_EMAIL e
 * DEMO_PASSWORD sono impostate. avvia.sh le imposta in locale; su Render non
 * ci sono, quindi in produzione non esiste.
 */
@Component
public class UtenteDemoSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(UtenteDemoSeeder.class);

	private final UtenteRepository utenti;
	private final PasswordEncoder passwordEncoder;
	private final String email;
	private final String password;

	public UtenteDemoSeeder(UtenteRepository utenti, PasswordEncoder passwordEncoder,
							@Value("${app.demo.email:}") String email,
							@Value("${app.demo.password:}") String password) {
		this.utenti = utenti;
		this.passwordEncoder = passwordEncoder;
		this.email = email;
		this.password = password;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (email.isBlank() || password.isBlank()) {
			return;
		}
		String normalizzata = email.trim().toLowerCase(Locale.ROOT);
		if (utenti.existsByEmail(normalizzata)) {
			return;
		}
		utenti.save(new Utente("Prova", "Catalogo", normalizzata, passwordEncoder.encode(password), Ruolo.USER));
		log.info("[demo] utente di prova creato");
	}
}
