package it.epicode.base.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

/** Token monouso per reimpostare la password. Si salva solo l'hash. */
@Entity
@Table(name = "token_password")
public class TokenPassword {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "utente_id")
	private Utente utente;

	@Column(nullable = false, unique = true, length = 64)
	private String tokenHash;

	@Column(nullable = false)
	private Instant scadenza;

	@Column(nullable = false)
	private boolean usato = false;

	protected TokenPassword() {
	}

	public TokenPassword(Utente utente, String tokenHash, Instant scadenza) {
		this.utente = utente;
		this.tokenHash = tokenHash;
		this.scadenza = scadenza;
	}

	public boolean isValido(Instant adesso) {
		return !usato && adesso.isBefore(scadenza);
	}

	public Long getId() {
		return id;
	}

	public Utente getUtente() {
		return utente;
	}

	public Instant getScadenza() {
		return scadenza;
	}

	public boolean isUsato() {
		return usato;
	}

	public void setUsato(boolean usato) {
		this.usato = usato;
	}
}
