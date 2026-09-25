package it.epicode.base.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Annuncio del salone. Visibile al pubblico solo quando e' PUBBLICATO. */
@Entity
@Table(name = "auto")
public class Auto {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 120)
	private String titolo;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String descrizione;

	@Column(nullable = false)
	private Integer km;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 15)
	private Carburante carburante;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal prezzo;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private Condizione condizione;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 12)
	private StatoAnnuncio stato;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "auto_immagini", joinColumns = @JoinColumn(name = "auto_id"))
	@OrderColumn(name = "posizione")
	@Column(name = "url", nullable = false, length = 500)
	private List<String> immagini = new ArrayList<>();

	@Column(nullable = false)
	private Instant creatoIl;

	@Column(nullable = false)
	private Instant aggiornatoIl;

	public Auto() {
	}

	@PrePersist
	void primaDelSalvataggio() {
		creatoIl = Instant.now();
		aggiornatoIl = creatoIl;
	}

	@PreUpdate
	void primaDellAggiornamento() {
		aggiornatoIl = Instant.now();
	}

	public boolean isPubblicato() {
		return stato == StatoAnnuncio.PUBBLICATO;
	}

	public Long getId() {
		return id;
	}

	public String getTitolo() {
		return titolo;
	}

	public void setTitolo(String titolo) {
		this.titolo = titolo;
	}

	public String getDescrizione() {
		return descrizione;
	}

	public void setDescrizione(String descrizione) {
		this.descrizione = descrizione;
	}

	public Integer getKm() {
		return km;
	}

	public void setKm(Integer km) {
		this.km = km;
	}

	public Carburante getCarburante() {
		return carburante;
	}

	public void setCarburante(Carburante carburante) {
		this.carburante = carburante;
	}

	public BigDecimal getPrezzo() {
		return prezzo;
	}

	public void setPrezzo(BigDecimal prezzo) {
		this.prezzo = prezzo;
	}

	public Condizione getCondizione() {
		return condizione;
	}

	public void setCondizione(Condizione condizione) {
		this.condizione = condizione;
	}

	public StatoAnnuncio getStato() {
		return stato;
	}

	public void setStato(StatoAnnuncio stato) {
		this.stato = stato;
	}

	public List<String> getImmagini() {
		return immagini;
	}

	public void setImmagini(List<String> immagini) {
		this.immagini.clear();
		this.immagini.addAll(immagini);
	}

	public Instant getCreatoIl() {
		return creatoIl;
	}

	public Instant getAggiornatoIl() {
		return aggiornatoIl;
	}
}
