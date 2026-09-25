package it.epicode.base.dto;

import it.epicode.base.dto.AutoDto.AutoCardResponse;
import it.epicode.base.model.Avviso;
import it.epicode.base.model.Preferito;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Preferiti e avvisi. Il proprietario non compare mai nel corpo: lo decide il
 * server dal token. Un "utenteId", "inviato" o "attivo" aggiunto al JSON viene
 * ignorato.
 */
public final class PreferitiDto {

	private PreferitiDto() {
	}

	public record PreferitoRequest(@NotNull @Positive Long autoId) {
	}

	public record PreferitoResponse(Long id, AutoCardResponse auto) {

		public static PreferitoResponse da(Preferito p) {
			return new PreferitoResponse(p.getId(), AutoCardResponse.da(p.getAuto()));
		}
	}

	public record AvvisoRequest(
			@NotNull @Positive Long autoId,
			@NotNull @DecimalMin("0.01") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal soglia) {
	}

	public record AvvisoUpdateRequest(
			@NotNull @DecimalMin("0.01") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal soglia) {
	}

	public record AvvisoResponse(Long id, Long autoId, String titoloAuto, BigDecimal prezzoAttuale,
								 BigDecimal soglia, boolean attivo) {

		public static AvvisoResponse da(Avviso a) {
			return new AvvisoResponse(a.getId(), a.getAuto().getId(), a.getAuto().getTitolo(),
					a.getAuto().getPrezzo(), a.getSoglia(), a.isAttivo());
		}
	}

	public record DisattivaRequest(@NotNull @jakarta.validation.constraints.Size(max = 100) String token) {
	}
}
