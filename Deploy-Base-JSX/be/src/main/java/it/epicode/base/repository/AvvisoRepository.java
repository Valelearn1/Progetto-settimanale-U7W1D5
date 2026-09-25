package it.epicode.base.repository;

import it.epicode.base.model.Avviso;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
