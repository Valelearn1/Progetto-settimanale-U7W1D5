package it.epicode.base.repository;

import it.epicode.base.model.Auto;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Locale;

/**
 * Filtri del catalogo costruiti con la Criteria API: ogni valore arrivato dal
 * client diventa un parametro legato, non si concatena mai testo nella query.
 * Ogni metodo restituisce null quando il filtro non e' richiesto: chi li
 * combina (AutoService) scarta i null.
 */
public final class AutoSpecifications {

	private static final char ESCAPE = '\\';

	private AutoSpecifications() {
	}

	public static Specification<Auto> conStato(StatoAnnuncio stato) {
		return stato == null ? null : (root, query, cb) -> cb.equal(root.get("stato"), stato);
	}

	/** Cerca nel titolo; % e _ scritti dall'utente valgono come caratteri normali. */
	public static Specification<Auto> titoloContiene(String testo) {
		if (testo == null || testo.isBlank()) {
			return null;
		}
		String modello = "%" + escapeLike(testo.trim().toLowerCase(Locale.ROOT)) + "%";
		return (root, query, cb) -> cb.like(cb.lower(root.get("titolo")), modello, ESCAPE);
	}

	public static Specification<Auto> conCarburante(Carburante carburante) {
		return carburante == null ? null : (root, query, cb) -> cb.equal(root.get("carburante"), carburante);
	}

	public static Specification<Auto> conCondizione(Condizione condizione) {
		return condizione == null ? null : (root, query, cb) -> cb.equal(root.get("condizione"), condizione);
	}

	public static Specification<Auto> prezzoAlmeno(BigDecimal minimo) {
		return minimo == null ? null : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("prezzo"), minimo);
	}

	public static Specification<Auto> prezzoAlPiu(BigDecimal massimo) {
		return massimo == null ? null : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("prezzo"), massimo);
	}

	public static Specification<Auto> kmAlmeno(Integer minimo) {
		return minimo == null ? null : (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("km"), minimo);
	}

	public static Specification<Auto> kmAlPiu(Integer massimo) {
		return massimo == null ? null : (root, query, cb) -> cb.lessThanOrEqualTo(root.get("km"), massimo);
	}

	static String escapeLike(String testo) {
		StringBuilder sb = new StringBuilder(testo.length());
		for (char c : testo.toCharArray()) {
			if (c == '%' || c == '_' || c == ESCAPE) {
				sb.append(ESCAPE);
			}
			sb.append(c);
		}
		return sb.toString();
	}
}
