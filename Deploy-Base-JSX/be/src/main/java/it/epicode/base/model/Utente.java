package it.epicode.base.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "utenti")
public class Utente {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 60)
	private String nome;

	@Column(nullable = false, length = 60)
	private String cognome;

	/** Sempre in minuscolo: il confronto al login non dipende dalle maiuscole. */
	@Column(nullable = false, unique = true, length = 254)
	private String email;

	@Column(nullable = false, length = 100)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Ruolo ruolo;

	@Column(nullable = false)
	private Instant creatoIl;

	protected Utente() {
	}

	public Utente(String nome, String cognome, String email, String passwordHash, Ruolo ruolo) {
		this.nome = nome;
		this.cognome = cognome;
		this.email = email;
		this.passwordHash = passwordHash;
		this.ruolo = ruolo;
		this.creatoIl = Instant.now();
	}

	public Long getId() {
		return id;
	}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCognome() {
		return cognome;
	}

	public void setCognome(String cognome) {
		this.cognome = cognome;
	}

	public String getEmail() {
		return email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public Ruolo getRuolo() {
		return ruolo;
	}

	public Instant getCreatoIl() {
		return creatoIl;
	}
}
