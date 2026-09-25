package it.epicode.base.web;

import it.epicode.base.dto.AutoDto.AutoCardResponse;
import it.epicode.base.dto.AutoDto.AutoResponse;
import it.epicode.base.dto.PaginaResponse;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.service.AutoService;
import it.epicode.base.service.AutoService.Filtri;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

/** Catalogo pubblico: anche senza login, solo annunci PUBBLICATI. */
@RestController
@RequestMapping("/api/auto")
public class AutoController {

	private final AutoService autoService;

	public AutoController(AutoService autoService) {
		this.autoService = autoService;
	}

	@GetMapping
	public PaginaResponse<AutoCardResponse> cerca(
			@RequestParam(required = false) @Size(max = 100) String q,
			@RequestParam(required = false) Carburante carburante,
			@RequestParam(required = false) Condizione condizione,
			@RequestParam(required = false) @PositiveOrZero BigDecimal prezzoMin,
			@RequestParam(required = false) @PositiveOrZero BigDecimal prezzoMax,
			@RequestParam(required = false) @PositiveOrZero Integer kmMin,
			@RequestParam(required = false) @PositiveOrZero Integer kmMax,
			@RequestParam(defaultValue = "recenti") String sort,
			@RequestParam(defaultValue = "desc") String dir,
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "12") @Min(1) @Max(50) int size) {
		Filtri filtri = new Filtri(q, carburante, condizione, prezzoMin, prezzoMax, kmMin, kmMax);
		return autoService.cercaPubblicate(filtri, sort, dir, page, size);
	}

	@GetMapping("/{id}")
	public AutoResponse dettaglio(@PathVariable Long id) {
		return autoService.dettaglioPubblico(id);
	}
}
