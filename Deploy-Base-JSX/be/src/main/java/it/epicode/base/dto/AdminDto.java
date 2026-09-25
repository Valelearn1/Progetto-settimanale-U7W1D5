package it.epicode.base.dto;

import it.epicode.base.model.Auto;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/** Risposte del pannello admin. */
public final class AdminDto {

	private AdminDto() {
	}

	/** Riquadri in cima al pannello: calcolati dal database in poche query. */
	public record StatisticheResponse(long totale, long pubblicati, long bozze,
									  BigDecimal valorePubblicati, BigDecimal prezzoMedio, long avvisiAttivi) {
	}

	/** Riga della tabella admin: come la card, piu' avvisi attivi e ultima modifica. */
	public record AutoAdminResponse(
			Long id, String titolo, Integer km, Carburante carburante, BigDecimal prezzo,
			Condizione condizione, StatoAnnuncio stato, String copertina, int numeroFoto,
			long avvisiAttivi, Instant aggiornatoIl) {

		public static AutoAdminResponse da(Auto a, long avvisiAttivi) {
			List<String> immagini = a.getImmagini();
			return new AutoAdminResponse(a.getId(), a.getTitolo(), a.getKm(), a.getCarburante(), a.getPrezzo(),
					a.getCondizione(), a.getStato(), immagini.isEmpty() ? null : immagini.getFirst(), immagini.size(),
					avvisiAttivi, a.getAggiornatoIl());
		}
	}
}
