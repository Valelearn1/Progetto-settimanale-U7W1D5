package it.epicode.base.service;

import it.epicode.base.dto.PreferitiDto.PreferitoResponse;
import it.epicode.base.errore.ConflittoException;
import it.epicode.base.errore.NonTrovatoException;
import it.epicode.base.model.Auto;
import it.epicode.base.model.Preferito;
import it.epicode.base.model.StatoAnnuncio;
import it.epicode.base.repository.AutoRepository;
import it.epicode.base.repository.AvvisoRepository;
import it.epicode.base.repository.PreferitoRepository;
import it.epicode.base.repository.UtenteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PreferitiService {

	private final PreferitoRepository preferiti;
	private final AvvisoRepository avvisi;
	private final AutoRepository autoRepository;
	private final UtenteRepository utenti;

	public PreferitiService(PreferitoRepository preferiti, AvvisoRepository avvisi,
							AutoRepository autoRepository, UtenteRepository utenti) {
		this.preferiti = preferiti;
		this.avvisi = avvisi;
		this.autoRepository = autoRepository;
		this.utenti = utenti;
	}

	@Transactional(readOnly = true)
	public List<PreferitoResponse> elenco(Long utenteId) {
		return preferiti.findAllByUtenteIdOrderByCreatoIlDesc(utenteId).stream()
				.map(PreferitoResponse::da)
				.toList();
	}

	/** Si possono salvare solo auto pubblicate: una bozza risponde 404. */
	@Transactional
	public PreferitoResponse aggiungi(Long utenteId, Long autoId) {
		Auto auto = autoRepository.findByIdAndStato(autoId, StatoAnnuncio.PUBBLICATO)
				.orElseThrow(NonTrovatoException::new);
		if (preferiti.existsByUtenteIdAndAutoId(utenteId, autoId)) {
			throw new ConflittoException("Auto gia' tra i preferiti");
		}
		Preferito p = preferiti.save(new Preferito(utenti.getReferenceById(utenteId), auto));
		return PreferitoResponse.da(p);
	}

	/** Togliendo un preferito si toglie anche l'avviso di prezzo collegato. */
	@Transactional
	public void rimuovi(Long utenteId, Long preferitoId) {
		Preferito p = preferiti.findByIdAndUtenteId(preferitoId, utenteId)
				.orElseThrow(NonTrovatoException::new);
		avvisi.findByUtenteIdAndAutoId(utenteId, p.getAuto().getId()).ifPresent(avvisi::delete);
		preferiti.delete(p);
	}
}
