package it.epicode.base.repository;

import it.epicode.base.model.Avviso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/** Come per i preferiti: si cerca sempre per id e proprietario insieme. */
public interface AvvisoRepository extends JpaRepository<Avviso, Long> {

	@EntityGraph(attributePaths = "auto")
	Optional<Avviso> findByIdAndUtenteId(Long id, Long utenteId);

	@EntityGraph(attributePaths = "auto")
	List<Avviso> findAllByUtenteIdOrderByCreatoIlDesc(Long utenteId);

	Optional<Avviso> findByUtenteIdAndAutoId(Long utenteId, Long autoId);

	boolean existsByUtenteIdAndAutoId(Long utenteId, Long autoId);

	@EntityGraph(attributePaths = {"utente", "auto"})
	List<Avviso> findAllByAutoIdAndAttivoTrue(Long autoId);

	Optional<Avviso> findByTokenHash(String tokenHash);

	long countByAttivoTrue();

	/**
	 * Segna l'avviso come inviato in un colpo solo: controllo e scrittura sono la
	 * stessa istruzione. Con due ribassi ravvicinati solo uno trova inviato = false
	 * e aggiorna la riga (restituisce 1); l'altro restituisce 0 e non spedisce.
	 */
	@Modifying
	@Query("update Avviso a set a.inviato = true, a.tokenHash = :tokenHash where a.id = :id and a.inviato = false and a.attivo = true")
	int segnaInviato(Long id, String tokenHash);

	/** Prezzo tornato sopra la soglia: l'avviso potra' scattare di nuovo. */
	@Modifying
	@Query("update Avviso a set a.inviato = false where a.id = :id and a.inviato = true")
	int ricarica(Long id);

	@Modifying
	@Query("delete from Avviso a where a.utente.id = :utenteId")
	int eliminaTuttiPerUtente(Long utenteId);

	/** Per ogni auto della pagina admin: quanti avvisi attivi la seguono (una query sola). */
	@Query("select a.auto.id, count(a) from Avviso a where a.attivo = true and a.auto.id in :autoIds group by a.auto.id")
	List<Object[]> contaAttiviPerAuto(Collection<Long> autoIds);
}
