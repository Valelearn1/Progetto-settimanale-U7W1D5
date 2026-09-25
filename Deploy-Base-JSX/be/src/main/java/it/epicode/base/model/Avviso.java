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
import jakarta.persistence.UniqueConstraint;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Avviso di prezzo: l'utente vuole una mail quando il prezzo dell'auto scende
 * sotto la soglia. {@code inviato} evita di mandare la stessa mail a ogni
 * ribasso; torna false se il prezzo risale sopra la soglia.
 *
 * Il link di disattivazione nella mail porta un token casuale: qui se ne salva
 * solo l'hash, cosi' chi legge il database non puo' usarlo.
 */
@Entity
@Table(name = "avvisi", uniqueConstraints = @UniqueConstraint(columnNames = {"utente_id", "auto_id"}))
public class Avviso {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "utente_id")
	private Utente utente;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "auto_id")
	private Auto auto;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal soglia;

	@Column(nullable = false)
	private boolean attivo = true;

	@Column(nullable = false)
	private boolean inviato = false;

	@Column(unique = true, length = 64)
	private String tokenHash;

	@Column(nullable = false)
	private Instant creatoIl;

	protected Avviso() {
	}

	public Avviso(Utente utente, Auto auto, BigDecimal soglia) {
		this.utente = utente;
		this.auto = auto;
		this.soglia = soglia;
		this.creatoIl = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public Utente getUtente() {
		return utente;
	}

	public Auto getAuto() {
		return auto;
	}

	public BigDecimal getSoglia() {
		return soglia;
	}

	public void setSoglia(BigDecimal soglia) {
		this.soglia = soglia;
	}

	public boolean isAttivo() {
		return attivo;
	}

	public void setAttivo(boolean attivo) {
		this.attivo = attivo;
	}

	public boolean isInviato() {
		return inviato;
	}

	public void setInviato(boolean inviato) {
		this.inviato = inviato;
	}

	public String getTokenHash() {
		return tokenHash;
	}

	public void setTokenHash(String tokenHash) {
		this.tokenHash = tokenHash;
	}

	public Instant getCreatoIl() {
		return creatoIl;
	}
}
