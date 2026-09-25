package it.epicode.base.repository;

import it.epicode.base.model.TokenPassword;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface TokenPasswordRepository extends JpaRepository<TokenPassword, Long> {

	@EntityGraph(attributePaths = "utente")
	Optional<TokenPassword> findByTokenHash(String tokenHash);

	/** Una nuova richiesta invalida i link mandati prima. */
	@Modifying
	@Query("update TokenPassword t set t.usato = true where t.utente.id = :utenteId and t.usato = false")
	void invalidaTuttiPerUtente(Long utenteId);
}
