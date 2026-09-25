package it.epicode.base.service;

import it.epicode.base.dto.AutoDto.AutoCardResponse;
import it.epicode.base.dto.AutoDto.AutoRequest;
import it.epicode.base.dto.AutoDto.AutoResponse;
import it.epicode.base.dto.PaginaResponse;
import it.epicode.base.errore.NonTrovatoException;
import it.epicode.base.errore.RichiestaNonValidaException;
import it.epicode.base.model.Auto;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;
import it.epicode.base.repository.AutoRepository;
import it.epicode.base.repository.AutoSpecifications;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

@Service
public class AutoService {

	/**
	 * Unici ordinamenti ammessi: chiave pubblica -> campo dell'entita'.
	 * Il valore arrivato dal client si usa solo per cercare in questa mappa,
	 * non finisce mai nella query.
	 */
	private static final Map<String, String> ORDINAMENTI = Map.of(
			"recenti", "creatoIl",
			"prezzo", "prezzo",
			"km", "km",
			"titolo", "titolo");

	private final AutoRepository autoRepository;
	private final ApplicationEventPublisher eventi;

	public AutoService(AutoRepository autoRepository, ApplicationEventPublisher eventi) {
		this.autoRepository = autoRepository;
		this.eventi = eventi;
	}

	/** Filtri del catalogo: tutti facoltativi. */
	public record Filtri(String q, Carburante carburante, Condizione condizione,
						 BigDecimal prezzoMin, BigDecimal prezzoMax, Integer kmMin, Integer kmMax) {
	}

	// ---------- pubblico ----------

	@Transactional(readOnly = true)
	public PaginaResponse<AutoCardResponse> cercaPubblicate(Filtri f, String sort, String dir, int page, int size) {
		return cerca(StatoAnnuncio.PUBBLICATO, f, sort, dir, page, size);
	}

	/** Una bozza per il pubblico non esiste: 404. */
	@Transactional(readOnly = true)
	public AutoResponse dettaglioPubblico(Long id) {
		return autoRepository.findByIdAndStato(id, StatoAnnuncio.PUBBLICATO)
				.map(AutoResponse::da)
				.orElseThrow(NonTrovatoException::new);
	}

	// ---------- admin ----------

	@Transactional(readOnly = true)
	public PaginaResponse<AutoCardResponse> cercaAdmin(StatoAnnuncio stato, Filtri f, String sort, String dir, int page, int size) {
		return cerca(stato, f, sort, dir, page, size);
	}

	@Transactional(readOnly = true)
	public AutoResponse dettaglioAdmin(Long id) {
		return AutoResponse.da(trova(id));
	}

	@Transactional
	public AutoResponse crea(AutoRequest req) {
		Auto auto = new Auto();
		copia(req, auto);
		return AutoResponse.da(autoRepository.save(auto));
	}

	@Transactional
	public AutoResponse aggiorna(Long id, AutoRequest req) {
		Auto auto = trova(id);
		BigDecimal prezzoPrima = auto.getPrezzo();
		StatoAnnuncio statoPrima = auto.getStato();
		copia(req, auto);
		notificaSeServe(auto, prezzoPrima, statoPrima);
		return AutoResponse.da(auto);
	}

	@Transactional
	public AutoResponse cambiaPrezzo(Long id, BigDecimal nuovoPrezzo) {
		Auto auto = trova(id);
		BigDecimal prezzoPrima = auto.getPrezzo();
		auto.setPrezzo(nuovoPrezzo);
		notificaSeServe(auto, prezzoPrima, auto.getStato());
		return AutoResponse.da(auto);
	}

	@Transactional
	public AutoResponse cambiaStato(Long id, StatoAnnuncio stato) {
		Auto auto = trova(id);
		StatoAnnuncio statoPrima = auto.getStato();
		auto.setStato(stato);
		notificaSeServe(auto, auto.getPrezzo(), statoPrima);
		return AutoResponse.da(auto);
	}

	// ---------- interni ----------

	private PaginaResponse<AutoCardResponse> cerca(StatoAnnuncio stato, Filtri f, String sort, String dir, int page, int size) {
		String campo = ORDINAMENTI.get(sort);
		if (campo == null) {
			throw new RichiestaNonValidaException("Ordinamento non ammesso");
		}
		Sort.Direction direzione = switch (dir) {
			case "asc" -> Sort.Direction.ASC;
			case "desc" -> Sort.Direction.DESC;
			default -> throw new RichiestaNonValidaException("Direzione non ammessa");
		};
		// Secondo criterio fisso sull'id: a parita' di prezzo le pagine restano stabili.
		Sort ordine = Sort.by(direzione, campo).and(Sort.by(Sort.Direction.ASC, "id"));

		// I filtri non richiesti valgono null: Spring Data 4 non li accetta in allOf, si scartano prima.
		Specification<Auto> spec = Specification.allOf(Stream.of(
						AutoSpecifications.conStato(stato),
						AutoSpecifications.titoloContiene(f.q()),
						AutoSpecifications.conCarburante(f.carburante()),
						AutoSpecifications.conCondizione(f.condizione()),
						AutoSpecifications.prezzoAlmeno(f.prezzoMin()),
						AutoSpecifications.prezzoAlPiu(f.prezzoMax()),
						AutoSpecifications.kmAlmeno(f.kmMin()),
						AutoSpecifications.kmAlPiu(f.kmMax()))
				.filter(Objects::nonNull)
				.toList());

		return PaginaResponse.da(autoRepository.findAll(spec, PageRequest.of(page, size, ordine)), AutoCardResponse::da);
	}

	private Auto trova(Long id) {
		return autoRepository.findById(id).orElseThrow(NonTrovatoException::new);
	}

	/** Campo per campo dal DTO: nessun id, data o altro campo interno arriva dal client. */
	private static void copia(AutoRequest req, Auto auto) {
		auto.setTitolo(req.titolo().trim());
		auto.setDescrizione(req.descrizione());
		auto.setKm(req.km());
		auto.setCarburante(req.carburante());
		auto.setPrezzo(req.prezzo());
		auto.setCondizione(req.condizione());
		auto.setImmagini(req.immagini().stream().map(String::trim).toList());
		auto.setStato(req.stato());
	}

	/** Gli avvisi si ricontrollano se e' cambiato il prezzo o se l'annuncio e' appena stato pubblicato. */
	private void notificaSeServe(Auto auto, BigDecimal prezzoPrima, StatoAnnuncio statoPrima) {
		boolean prezzoCambiato = prezzoPrima.compareTo(auto.getPrezzo()) != 0;
		boolean appenaPubblicato = !Objects.equals(statoPrima, auto.getStato()) && auto.isPubblicato();
		if (prezzoCambiato || appenaPubblicato) {
			eventi.publishEvent(new Eventi.PrezzoCambiato(auto.getId()));
		}
	}
}
