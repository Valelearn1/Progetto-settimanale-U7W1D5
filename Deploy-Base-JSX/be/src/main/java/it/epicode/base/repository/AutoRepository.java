package it.epicode.base.repository;

import it.epicode.base.model.Auto;
import it.epicode.base.model.StatoAnnuncio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AutoRepository extends JpaRepository<Auto, Long>, JpaSpecificationExecutor<Auto> {

	Optional<Auto> findByIdAndStato(Long id, StatoAnnuncio stato);

	long countByStato(StatoAnnuncio stato);

	/** Somma e media dei prezzi degli annunci con quello stato, in una query. */
	@Query("select coalesce(sum(a.prezzo), 0), coalesce(avg(a.prezzo), 0) from Auto a where a.stato = :stato")
	List<Object[]> sommaEMediaPrezzi(StatoAnnuncio stato);
}
