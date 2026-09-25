package it.epicode.base.web;

import it.epicode.base.dto.AuthDto.LoginRequest;
import it.epicode.base.dto.AuthDto.PasswordDimenticataRequest;
import it.epicode.base.dto.AuthDto.RegistrazioneRequest;
import it.epicode.base.dto.AuthDto.ReimpostaPasswordRequest;
import it.epicode.base.dto.AuthDto.TokenResponse;
import it.epicode.base.errore.CredenzialiNonValideException;
import it.epicode.base.security.LimitatoreTentativi;
import it.epicode.base.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Locale;

/**
 * Autenticazione. Ogni endpoint ha un limite di tentativi (429 oltre la soglia):
 * niente password provate a raffica, niente mail di reset a pioggia.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private static final Duration QUINDICI_MINUTI = Duration.ofMinutes(15);
	private static final Duration UN_ORA = Duration.ofHours(1);

	private final AuthService authService;
	private final LimitatoreTentativi limitatore;
	private final int loginErratiPerEmail;
	private final int loginPerIp;
	private final int resetPerEmail;
	private final int resetPerIp;
	private final int registrazioniPerIp;

	public AuthController(AuthService authService, LimitatoreTentativi limitatore,
						  @Value("${app.limiti.login-errati-per-email:5}") int loginErratiPerEmail,
						  @Value("${app.limiti.login-per-ip:30}") int loginPerIp,
						  @Value("${app.limiti.reset-per-email:3}") int resetPerEmail,
						  @Value("${app.limiti.reset-per-ip:10}") int resetPerIp,
						  @Value("${app.limiti.registrazioni-per-ip:10}") int registrazioniPerIp) {
		this.authService = authService;
		this.limitatore = limitatore;
		this.loginErratiPerEmail = loginErratiPerEmail;
		this.loginPerIp = loginPerIp;
		this.resetPerEmail = resetPerEmail;
		this.resetPerIp = resetPerIp;
		this.registrazioniPerIp = registrazioniPerIp;
	}

	@PostMapping("/registrazione")
	@ResponseStatus(HttpStatus.CREATED)
	public TokenResponse registrazione(@Valid @RequestBody RegistrazioneRequest req, HttpServletRequest http) {
		limitatore.consuma("registrazione:" + http.getRemoteAddr(), registrazioniPerIp, UN_ORA);
		return new TokenResponse(authService.registra(req));
	}

	@PostMapping("/login")
	public TokenResponse login(@Valid @RequestBody LoginRequest req, HttpServletRequest http) {
		String chiaveEmail = "login-errati:" + req.email().trim().toLowerCase(Locale.ROOT);
		// Email gia' bloccata: si risponde 429 senza nemmeno controllare la password.
		limitatore.verifica(chiaveEmail, loginErratiPerEmail, QUINDICI_MINUTI);
		limitatore.consuma("login:" + http.getRemoteAddr(), loginPerIp, QUINDICI_MINUTI);
		try {
			String token = authService.login(req);
			limitatore.azzera(chiaveEmail);
			return new TokenResponse(token);
		} catch (CredenzialiNonValideException e) {
			limitatore.consuma(chiaveEmail, Integer.MAX_VALUE, QUINDICI_MINUTI);
			throw e;
		}
	}

	/** Sempre 204: la risposta non dice se l'email e' registrata. */
	@PostMapping("/password-dimenticata")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void passwordDimenticata(@Valid @RequestBody PasswordDimenticataRequest req, HttpServletRequest http) {
		limitatore.consuma("reset-ip:" + http.getRemoteAddr(), resetPerIp, UN_ORA);
		limitatore.consuma("reset-email:" + req.email().trim().toLowerCase(Locale.ROOT), resetPerEmail, UN_ORA);
		authService.passwordDimenticata(req.email());
	}

	@PostMapping("/reimposta-password")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void reimpostaPassword(@Valid @RequestBody ReimpostaPasswordRequest req, HttpServletRequest http) {
		limitatore.consuma("reimposta:" + http.getRemoteAddr(), registrazioniPerIp, UN_ORA);
		authService.reimpostaPassword(req);
	}
}
