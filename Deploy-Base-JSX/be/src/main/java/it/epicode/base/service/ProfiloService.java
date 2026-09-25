package it.epicode.base.service;

import it.epicode.base.dto.ProfiloDto.ProfiloResponse;
import it.epicode.base.dto.ProfiloDto.ProfiloUpdateRequest;
import it.epicode.base.errore.NonTrovatoException;
import it.epicode.base.errore.RichiestaNonValidaException;
import it.epicode.base.model.Ruolo;
import it.epicode.base.model.Utente;
import it.epicode.base.repository.AvvisoRepository;
import it.epicode.base.repository.PreferitoRepository;
import it.epicode.base.repository.TokenPasswordRepository;
import it.epicode.base.repository.UtenteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfiloService {

	private static final Logger log = LoggerFactory.getLogger(ProfiloService.class);

	private final UtenteRepository utenti;
	private final AvvisoRepository avvisi;
	private final PreferitoRepository preferiti;
	private final TokenPasswordRepository tokenPassword;

	public ProfiloService(UtenteRepository utenti, AvvisoRepository avvisi, PreferitoRepository preferiti,
						  TokenPasswordRepository tokenPassword) {
		this.utenti = utenti;
		this.avvisi = avvisi;
		this.preferiti = preferiti;
		this.tokenPassword = tokenPassword;
	}

	@Transactional(readOnly = true)
	public ProfiloResponse leggi(Long utenteId) {
		return ProfiloResponse.da(trova(utenteId));
	}

	/** Si copiano solo nome e cognome dal DTO: il resto dell'entita' non si tocca. */
	@Transactional
	public ProfiloResponse aggiorna(Long utenteId, ProfiloUpdateRequest req) {
		Utente utente = trova(utenteId);
		utente.setNome(req.nome().trim());
		utente.setCognome(req.cognome().trim());
		return ProfiloResponse.da(utente);
	}

	/**
	 * "Elimina il mio account": avvisi, preferiti, token di reset e utente, tutto
	 * nella stessa transazione. Senza avvisi non parte piu' nessuna mail; il JWT
	 * ancora in mano al browser smette di valere (l'utente non esiste piu').
	 * L'admin non si elimina da qui: il salone resterebbe senza amministratore.
	 */
	@Transactional
	public void elimina(Long utenteId) {
		Utente utente = trova(utenteId);
		if (utente.getRuolo() == Ruolo.ADMIN) {
			throw new RichiestaNonValidaException("L'account amministratore non si puo' eliminare dal profilo");
		}
		avvisi.eliminaTuttiPerUtente(utenteId);
		preferiti.eliminaTuttiPerUtente(utenteId);
		tokenPassword.eliminaTuttiPerUtente(utenteId);
		utenti.delete(utente);
		log.info("Account id={} eliminato su richiesta dell'utente", utenteId);
	}

	private Utente trova(Long utenteId) {
		return utenti.findById(utenteId).orElseThrow(NonTrovatoException::new);
	}
}
