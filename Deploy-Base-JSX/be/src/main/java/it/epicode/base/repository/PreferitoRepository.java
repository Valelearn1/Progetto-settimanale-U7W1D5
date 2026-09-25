package it.epicode.base.repository;

import it.epicode.base.model.Preferito;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Ogni ricerca passa per id E proprietario: con l'id di un altro utente il
 * risultato e' vuoto e il controller risponde 404, non 403.
 */
public interface PreferitoRepository extends JpaRepository<Preferito, Long> {

	Optional<Preferito> findByIdAndUtenteId(Long id, Long utenteId);

	@EntityGraph(attributePaths = "auto")
	List<Preferito> findAllByUtenteIdOrderByCreatoIlDesc(Long utenteId);

	boolean existsByUtenteIdAndAutoId(Long utenteId, Long autoId);
}
