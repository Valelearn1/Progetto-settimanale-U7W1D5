package it.epicode.base.web;

import it.epicode.base.dto.AuthDto.LoginRequest;
import it.epicode.base.dto.AuthDto.PasswordDimenticataRequest;
import it.epicode.base.dto.AuthDto.RegistrazioneRequest;
import it.epicode.base.dto.AuthDto.ReimpostaPasswordRequest;
import it.epicode.base.dto.AuthDto.TokenResponse;
import it.epicode.base.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/registrazione")
	@ResponseStatus(HttpStatus.CREATED)
	public TokenResponse registrazione(@Valid @RequestBody RegistrazioneRequest req) {
		return new TokenResponse(authService.registra(req));
	}

	@PostMapping("/login")
	public TokenResponse login(@Valid @RequestBody LoginRequest req) {
		return new TokenResponse(authService.login(req));
	}

	/** Sempre 204: la risposta non dice se l'email e' registrata. */
	@PostMapping("/password-dimenticata")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void passwordDimenticata(@Valid @RequestBody PasswordDimenticataRequest req) {
		authService.passwordDimenticata(req.email());
	}

	@PostMapping("/reimposta-password")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void reimpostaPassword(@Valid @RequestBody ReimpostaPasswordRequest req) {
		authService.reimpostaPassword(req);
	}
}
