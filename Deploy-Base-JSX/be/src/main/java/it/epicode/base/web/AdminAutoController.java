package it.epicode.base.web;

import it.epicode.base.dto.AutoDto.AutoCardResponse;
import it.epicode.base.dto.AutoDto.AutoRequest;
import it.epicode.base.dto.AutoDto.AutoResponse;
import it.epicode.base.dto.AutoDto.PrezzoRequest;
import it.epicode.base.dto.PaginaResponse;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;
import it.epicode.base.service.AutoService;
import it.epicode.base.service.AutoService.Filtri;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Gestione annunci. Doppia protezione: la regola su /api/admin/** in
 * SecurityConfig e @PreAuthorize qui. Un utente collegato non admin riceve 403.
 */
@RestController
@RequestMapping("/api/admin/auto")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAutoController {

	private final AutoService autoService;

	public AdminAutoController(AutoService autoService) {
		this.autoService = autoService;
	}

	/** Tutti gli annunci, bozze comprese; stato facoltativo per filtrare. */
	@GetMapping
	public PaginaResponse<AutoCardResponse> elenco(
			@RequestParam(required = false) StatoAnnuncio stato,
			@RequestParam(required = false) @Size(max = 100) String q,
			@RequestParam(required = false) Carburante carburante,
			@RequestParam(required = false) Condizione condizione,
			@RequestParam(defaultValue = "recenti") String sort,
			@RequestParam(defaultValue = "desc") String dir,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
		Filtri filtri = new Filtri(q, carburante, condizione, null, null, null, null);
		return autoService.cercaAdmin(stato, filtri, sort, dir, page, size);
	}

	@GetMapping("/{id}")
	public AutoResponse dettaglio(@PathVariable Long id) {
		return autoService.dettaglioAdmin(id);
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public AutoResponse crea(@Valid @RequestBody AutoRequest req) {
		return autoService.crea(req);
	}

	@PutMapping("/{id}")
	public AutoResponse aggiorna(@PathVariable Long id, @Valid @RequestBody AutoRequest req) {
		return autoService.aggiorna(id, req);
	}

	@PatchMapping("/{id}/prezzo")
	public AutoResponse cambiaPrezzo(@PathVariable Long id, @Valid @RequestBody PrezzoRequest req) {
		return autoService.cambiaPrezzo(id, req.prezzo());
	}

	@PostMapping("/{id}/pubblica")
	public AutoResponse pubblica(@PathVariable Long id) {
		return autoService.cambiaStato(id, StatoAnnuncio.PUBBLICATO);
	}

	@PostMapping("/{id}/bozza")
	public AutoResponse bozza(@PathVariable Long id) {
		return autoService.cambiaStato(id, StatoAnnuncio.BOZZA);
	}
}
