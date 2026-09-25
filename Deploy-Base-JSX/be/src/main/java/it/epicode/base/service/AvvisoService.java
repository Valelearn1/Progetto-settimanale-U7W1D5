package it.epicode.base.service;

import it.epicode.base.dto.PreferitiDto.AvvisoRequest;
import it.epicode.base.dto.PreferitiDto.AvvisoResponse;
import it.epicode.base.errore.ConflittoException;
import it.epicode.base.errore.NonTrovatoException;
import it.epicode.base.errore.RichiestaNonValidaException;
import it.epicode.base.mail.MailService;
import it.epicode.base.model.Auto;
import it.epicode.base.model.Avviso;
import it.epicode.base.model.StatoAnnuncio;
import it.epicode.base.repository.AutoRepository;
import it.epicode.base.repository.AvvisoRepository;
import it.epicode.base.repository.PreferitoRepository;
import it.epicode.base.repository.UtenteRepository;
import it.epicode.base.security.TokenCasuale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AvvisoService {

	private static final Logger log = LoggerFactory.getLogger(AvvisoService.class);

	private final AvvisoRepository avvisi;
	private final PreferitoRepository preferiti;
	private final AutoRepository autoRepository;
	private final UtenteRepository utenti;
	private final MailService mail;

	public AvvisoService(AvvisoRepository avvisi, PreferitoRepository preferiti, AutoRepository autoRepository,
						 UtenteRepository utenti, MailService mail) {
		this.avvisi = avvisi;
		this.preferiti = preferiti;
		this.autoRepository = autoRepository;
		this.utenti = utenti;
		this.mail = mail;
	}

	@Transactional(readOnly = true)
	public List<AvvisoResponse> elenco(Long utenteId) {
		return avvisi.findAllByUtenteIdOrderByCreatoIlDesc(utenteId).stream().map(AvvisoResponse::da).toList();
	}

	@Transactional(readOnly = true)
	public AvvisoResponse dettaglio(Long utenteId, Long avvisoId) {
		return AvvisoResponse.da(trova(utenteId, avvisoId));
	}

	/** L'avviso si imposta su un'auto pubblicata che l'utente ha tra i preferiti. */
	@Transactional
	public AvvisoResponse crea(Long utenteId, AvvisoRequest req) {
		Auto auto = autoRepository.findByIdAndStato(req.autoId(), StatoAnnuncio.PUBBLICATO)
				.orElseThrow(NonTrovatoException::new);
		if (!preferiti.existsByUtenteIdAndAutoId(utenteId, auto.getId())) {
			throw new RichiestaNonValidaException("Aggiungi prima l'auto ai preferiti");
		}
		if (avvisi.existsByUtenteIdAndAutoId(utenteId, auto.getId())) {
			throw new ConflittoException("Avviso gia' presente per questa auto");
		}
		controllaSoglia(req.soglia(), auto);
		Avviso avviso = avvisi.save(new Avviso(utenti.getReferenceById(utenteId), auto, req.soglia()));
		return AvvisoResponse.da(avviso);
	}

	/** Cambiare la soglia riattiva l'avviso, anche se era stato disattivato dalla mail. */
	@Transactional
	public AvvisoResponse aggiorna(Long utenteId, Long avvisoId, BigDecimal soglia) {
		Avviso avviso = trova(utenteId, avvisoId);
		controllaSoglia(soglia, avviso.getAuto());
		avviso.setSoglia(soglia);
		avviso.setAttivo(true);
		avviso.setInviato(false);
		return AvvisoResponse.da(avviso);
	}

	@Transactional
	public void elimina(Long utenteId, Long avvisoId) {
		avvisi.delete(trova(utenteId, avvisoId));
	}

	/**
	 * Link della mail. Il token e' monouso: dopo l'uso si cancella l'hash e lo
	 * stesso link risponde 404.
	 */
	@Transactional
	public void disattivaConToken(String token) {
		Avviso avviso = avvisi.findByTokenHash(TokenCasuale.hash(token)).orElseThrow(NonTrovatoException::new);
		avviso.setAttivo(false);
		avviso.setTokenHash(null);
		log.info("Avviso id={} disattivato dal link della mail", avviso.getId());
	}

	/**
	 * Chiamato dopo il commit di un cambio di prezzo o di stato. Manda la mail
	 * agli avvisi attivi con prezzo sotto la soglia, una volta sola: se il
	 * prezzo risale sopra la soglia l'avviso si "ricarica".
	 */
	@Transactional
	public void controllaPrezzo(Long autoId) {
		Auto auto = autoRepository.findById(autoId).orElse(null);
		if (auto == null) {
			return;
		}
		for (Avviso avviso : avvisi.findAllByAutoIdAndAttivoTrue(autoId)) {
			boolean sotto = auto.getPrezzo().compareTo(avviso.getSoglia()) < 0;
			if (sotto && !avviso.isInviato() && auto.isPubblicato()) {
				String token = TokenCasuale.genera();
				avviso.setTokenHash(TokenCasuale.hash(token));
				avviso.setInviato(true);
				mail.inviaAvvisoPrezzo(avviso, token);
			} else if (!sotto && avviso.isInviato()) {
				avviso.setInviato(false);
			}
		}
	}

	private Avviso trova(Long utenteId, Long avvisoId) {
		return avvisi.findByIdAndUtenteId(avvisoId, utenteId).orElseThrow(NonTrovatoException::new);
	}

	/** Una soglia gia' sopra il prezzo non scatterebbe mai: meglio dirlo subito. */
	private static void controllaSoglia(BigDecimal soglia, Auto auto) {
		if (soglia.compareTo(auto.getPrezzo()) >= 0) {
			throw new RichiestaNonValidaException("La soglia deve essere inferiore al prezzo attuale");
		}
	}
}
