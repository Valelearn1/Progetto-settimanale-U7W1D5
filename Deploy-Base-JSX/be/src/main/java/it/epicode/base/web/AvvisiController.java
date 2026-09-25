package it.epicode.base.web;

import it.epicode.base.dto.PreferitiDto.AvvisoRequest;
import it.epicode.base.dto.PreferitiDto.AvvisoResponse;
import it.epicode.base.dto.PreferitiDto.AvvisoUpdateRequest;
import it.epicode.base.dto.PreferitiDto.DisattivaRequest;
import it.epicode.base.security.UtenteCorrente;
import it.epicode.base.service.AvvisoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Avvisi di prezzo dell'utente collegato. /api/avvisi/13 di un altro utente
 * risponde 404 come se non esistesse.
 */
@RestController
@RequestMapping("/api/avvisi")
public class AvvisiController {

	private final AvvisoService avvisoService;

	public AvvisiController(AvvisoService avvisoService) {
		this.avvisoService = avvisoService;
	}

	@GetMapping
	public List<AvvisoResponse> elenco(@AuthenticationPrincipal Jwt jwt) {
		return avvisoService.elenco(UtenteCorrente.id(jwt));
	}

	@GetMapping("/{id}")
	public AvvisoResponse dettaglio(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
		return avvisoService.dettaglio(UtenteCorrente.id(jwt), id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AvvisoResponse crea(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody AvvisoRequest req) {
		return avvisoService.crea(UtenteCorrente.id(jwt), req);
	}

	@PutMapping("/{id}")
	public AvvisoResponse aggiorna(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id,
								   @Valid @RequestBody AvvisoUpdateRequest req) {
		return avvisoService.aggiorna(UtenteCorrente.id(jwt), id, req.soglia());
	}

	@DeleteMapping("/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void elimina(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
		avvisoService.elimina(UtenteCorrente.id(jwt), id);
	}

	/**
	 * Link della mail, pubblico: il token casuale e' la prova. POST e non GET,
	 * cosi' i client di posta che aprono i link in anteprima non lo consumano.
	 */
	@PostMapping("/disattiva")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void disattiva(@Valid @RequestBody DisattivaRequest req) {
		avvisoService.disattivaConToken(req.token());
	}
}
