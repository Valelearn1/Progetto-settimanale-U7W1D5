package it.epicode.base.service;

import it.epicode.base.dto.ProfiloDto.ProfiloResponse;
import it.epicode.base.dto.ProfiloDto.ProfiloUpdateRequest;
import it.epicode.base.errore.NonTrovatoException;
import it.epicode.base.model.Utente;
import it.epicode.base.repository.UtenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfiloService {

	private final UtenteRepository utenti;

	public ProfiloService(UtenteRepository utenti) {
		this.utenti = utenti;
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

	private Utente trova(Long utenteId) {
		return utenti.findById(utenteId).orElseThrow(NonTrovatoException::new);
	}
}
