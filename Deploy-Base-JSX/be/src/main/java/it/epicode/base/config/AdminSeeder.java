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
 * Nessun endpoint crea amministratori: l'unico admin nasce qui all'avvio, da
 * ADMIN_EMAIL e ADMIN_PASSWORD. Se le variabili mancano non si crea niente.
 */
@Component
public class AdminSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

	private final UtenteRepository utenti;
	private final PasswordEncoder passwordEncoder;
	private final String email;
	private final String password;

	public AdminSeeder(UtenteRepository utenti, PasswordEncoder passwordEncoder,
					   @Value("${app.admin.email:}") String email,
					   @Value("${app.admin.password:}") String password) {
		this.utenti = utenti;
		this.passwordEncoder = passwordEncoder;
		this.email = email;
		this.password = password;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (email.isBlank() || password.isBlank()) {
			log.info("[admin] ADMIN_EMAIL/ADMIN_PASSWORD non impostate: nessun admin creato");
			return;
		}
		String normalizzata = email.trim().toLowerCase(Locale.ROOT);
		if (utenti.existsByEmail(normalizzata)) {
			return;
		}
		utenti.save(new Utente("Admin", "Salone", normalizzata, passwordEncoder.encode(password), Ruolo.ADMIN));
		log.info("[admin] account amministratore creato");
	}
}
