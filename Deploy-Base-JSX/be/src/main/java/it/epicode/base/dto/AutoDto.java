package it.epicode.base.dto;

import it.epicode.base.model.Auto;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class AutoDto {

	private AutoDto() {
	}

	/** Creazione e modifica di un annuncio (solo admin). */
	public record AutoRequest(
			@NotBlank @Size(max = 120) String titolo,
			@NotBlank @Size(max = 5000) String descrizione,
			@NotNull @Min(0) @Max(2_000_000) Integer km,
			@NotNull Carburante carburante,
			@NotNull @DecimalMin(value = "0.01") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal prezzo,
			@NotNull Condizione condizione,
			@NotNull @Size(max = 10) List<@NotBlank @Size(max = 500) @UrlHttps String> immagini,
			@NotNull StatoAnnuncio stato) {
	}

	public record PrezzoRequest(
			@NotNull @DecimalMin(value = "0.01") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal prezzo) {
	}

	/** Dettaglio dell'annuncio. */
	public record AutoResponse(
			Long id, String titolo, String descrizione, Integer km, Carburante carburante,
			BigDecimal prezzo, Condizione condizione, StatoAnnuncio stato, List<String> immagini,
			Instant creatoIl, Instant aggiornatoIl) {

		public static AutoResponse da(Auto a) {
			return new AutoResponse(a.getId(), a.getTitolo(), a.getDescrizione(), a.getKm(), a.getCarburante(),
					a.getPrezzo(), a.getCondizione(), a.getStato(), List.copyOf(a.getImmagini()),
					a.getCreatoIl(), a.getAggiornatoIl());
		}
	}

	/**
	 * Versione ridotta per le liste: niente descrizione. Le immagini servono al
	 * mini-carousel della card (poche per annuncio, al massimo 10).
	 */
	public record AutoCardResponse(
			Long id, String titolo, Integer km, Carburante carburante, BigDecimal prezzo,
			Condizione condizione, StatoAnnuncio stato, String copertina, List<String> immagini) {

		public static AutoCardResponse da(Auto a) {
			String copertina = a.getImmagini().isEmpty() ? null : a.getImmagini().getFirst();
			return new AutoCardResponse(a.getId(), a.getTitolo(), a.getKm(), a.getCarburante(), a.getPrezzo(),
					a.getCondizione(), a.getStato(), copertina, List.copyOf(a.getImmagini()));
		}
	}
}
