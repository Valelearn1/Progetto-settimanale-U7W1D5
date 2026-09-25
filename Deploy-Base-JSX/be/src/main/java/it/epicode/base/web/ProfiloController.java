package it.epicode.base.web;

import it.epicode.base.dto.ProfiloDto.ProfiloResponse;
import it.epicode.base.dto.ProfiloDto.ProfiloUpdateRequest;
import it.epicode.base.security.UtenteCorrente;
import it.epicode.base.service.ProfiloService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Profilo dell'utente collegato: chi sia lo dice il JWT, non l'indirizzo. */
@RestController
@RequestMapping("/api/me")
public class ProfiloController {

	private final ProfiloService profiloService;

	public ProfiloController(ProfiloService profiloService) {
		this.profiloService = profiloService;
	}

	@GetMapping
	public ProfiloResponse leggi(@AuthenticationPrincipal Jwt jwt) {
		return profiloService.leggi(UtenteCorrente.id(jwt));
	}

	@PutMapping
	public ProfiloResponse aggiorna(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ProfiloUpdateRequest req) {
		return profiloService.aggiorna(UtenteCorrente.id(jwt), req);
	}
}
