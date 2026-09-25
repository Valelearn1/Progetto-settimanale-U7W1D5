package it.epicode.base.repository;

import it.epicode.base.model.Auto;
import it.epicode.base.model.StatoAnnuncio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface AutoRepository extends JpaRepository<Auto, Long>, JpaSpecificationExecutor<Auto> {

	Optional<Auto> findByIdAndStato(Long id, StatoAnnuncio stato);
}
