package it.epicode.base.web;

import it.epicode.base.dto.PreferitiDto.PreferitoRequest;
import it.epicode.base.dto.PreferitiDto.PreferitoResponse;
import it.epicode.base.security.UtenteCorrente;
import it.epicode.base.service.PreferitiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/preferiti")
public class PreferitiController {

	private final PreferitiService preferitiService;

	public PreferitiController(PreferitiService preferitiService) {
		this.preferitiService = preferitiService;
	}

	@GetMapping
	public List<PreferitoResponse> elenco(@AuthenticationPrincipal Jwt jwt) {
		return preferitiService.elenco(UtenteCorrente.id(jwt));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public PreferitoResponse aggiungi(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody PreferitoRequest req) {
		return preferitiService.aggiungi(UtenteCorrente.id(jwt), req.autoId());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void rimuovi(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
		preferitiService.rimuovi(UtenteCorrente.id(jwt), id);
	}
}
