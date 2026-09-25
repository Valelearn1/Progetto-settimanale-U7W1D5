package it.epicode.base.service;

import it.epicode.base.dto.AuthDto.LoginRequest;
import it.epicode.base.dto.AuthDto.RegistrazioneRequest;
import it.epicode.base.dto.AuthDto.ReimpostaPasswordRequest;
import it.epicode.base.errore.ConflittoException;
import it.epicode.base.errore.CredenzialiNonValideException;
import it.epicode.base.errore.RichiestaNonValidaException;
import it.epicode.base.model.Ruolo;
import it.epicode.base.model.TokenPassword;
import it.epicode.base.model.Utente;
import it.epicode.base.repository.TokenPasswordRepository;
import it.epicode.base.repository.UtenteRepository;
import it.epicode.base.security.JwtService;
import it.epicode.base.security.TokenCasuale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;

@Service
public class AuthService {

	private static final Logger log = LoggerFactory.getLogger(AuthService.class);

	private final UtenteRepository utenti;
	private final TokenPasswordRepository tokenPassword;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwt;
	private final ApplicationEventPublisher eventi;
	private final Duration durataReset;
	/** Hash di confronto quando l'email non esiste: il login dura uguale nei due casi. */
	private final String hashFittizio;

	public AuthService(UtenteRepository utenti, TokenPasswordRepository tokenPassword, PasswordEncoder passwordEncoder,
					   JwtService jwt, ApplicationEventPublisher eventi,
					   @Value("${app.reset-password.durata}") Duration durataReset) {
		this.utenti = utenti;
		this.tokenPassword = tokenPassword;
		this.passwordEncoder = passwordEncoder;
		this.jwt = jwt;
		this.eventi = eventi;
		this.durataReset = durataReset;
		this.hashFittizio = passwordEncoder.encode(TokenCasuale.genera());
	}

	/** Il ruolo lo decide il server: chi si registra e' sempre USER. */
	@Transactional
	public String registra(RegistrazioneRequest req) {
		String email = normalizza(req.email());
		if (utenti.existsByEmail(email)) {
			throw new ConflittoException("Email gia' registrata");
		}
		Utente utente = utenti.save(new Utente(req.nome().trim(), req.cognome().trim(), email,
				passwordEncoder.encode(req.password()), Ruolo.USER));
		log.info("Registrato utente id={}", utente.getId());
		return jwt.emetti(utente);
	}

	@Transactional(readOnly = true)
	public String login(LoginRequest req) {
		Optional<Utente> utente = utenti.findByEmail(normalizza(req.email()));
		String hash = utente.map(Utente::getPasswordHash).orElse(hashFittizio);
		boolean ok = passwordEncoder.matches(req.password(), hash);
		if (utente.isEmpty() || !ok) {
			throw new CredenzialiNonValideException();
		}
		return jwt.emetti(utente.get());
	}

	/**
	 * Risponde sempre allo stesso modo, che l'email esista o no. Se esiste,
	 * invalida i link precedenti e ne manda uno nuovo, valido per durataReset.
	 */
	@Transactional
	public void passwordDimenticata(String emailGrezza) {
		utenti.findByEmail(normalizza(emailGrezza)).ifPresent(utente -> {
			tokenPassword.invalidaTuttiPerUtente(utente.getId());
			String token = TokenCasuale.genera();
			tokenPassword.save(new TokenPassword(utente, TokenCasuale.hash(token), Instant.now().plus(durataReset)));
			eventi.publishEvent(new Eventi.ResetRichiesto(utente.getId(), token));
		});
	}

	@Transactional
	public void reimpostaPassword(ReimpostaPasswordRequest req) {
		TokenPassword token = tokenPassword.findByTokenHash(TokenCasuale.hash(req.token()))
				.filter(t -> t.isValido(Instant.now()))
				.orElseThrow(() -> new RichiestaNonValidaException("Link non valido o scaduto"));
		token.setUsato(true);
		Utente utente = token.getUtente();
		utente.setPasswordHash(passwordEncoder.encode(req.nuovaPassword()));
		log.info("Password reimpostata per utente id={}", utente.getId());
	}

	public Duration getDurataReset() {
		return durataReset;
	}

	static String normalizza(String email) {
		return email.trim().toLowerCase(Locale.ROOT);
	}
}
