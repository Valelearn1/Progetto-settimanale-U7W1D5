package it.epicode.base.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import it.epicode.base.model.Auto;
import it.epicode.base.model.Carburante;
import it.epicode.base.model.Condizione;
import it.epicode.base.model.StatoAnnuncio;
import it.epicode.base.repository.AutoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.List;

/**
 * Riempie il catalogo con gli annunci di seed/auto.json, solo se la tabella
 * auto e' vuota: al primo avvio si caricano, ai successivi non succede niente.
 *
 * Il file e' generato una volta sola (foto da Wikimedia Commons, crediti nel
 * campo "crediti"): a runtime non parte nessuna chiamata verso API esterne.
 * Si disattiva con APP_SEED_AUTO=false (i test lo fanno).
 */
@Component
public class AutoSeeder implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(AutoSeeder.class);

	private final AutoRepository autoRepository;
	private final JsonMapper jsonMapper;
	private final boolean attivo;

	public AutoSeeder(AutoRepository autoRepository, JsonMapper jsonMapper,
					  @Value("${app.seed.auto:true}") boolean attivo) {
		this.autoRepository = autoRepository;
		this.jsonMapper = jsonMapper;
		this.attivo = attivo;
	}

	/** Una riga di auto.json. "crediti" serve solo alla licenza delle foto e non si carica. */
	@JsonIgnoreProperties(ignoreUnknown = true)
	record AnnuncioSeed(String titolo, String descrizione, Integer km, Carburante carburante,
						BigDecimal prezzo, Condizione condizione, List<String> immagini) {
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) throws IOException {
		if (!attivo || autoRepository.count() > 0) {
			return;
		}
		List<AnnuncioSeed> annunci;
		try (InputStream in = new ClassPathResource("seed/auto.json").getInputStream()) {
			annunci = jsonMapper.readValue(in, new TypeReference<>() {
			});
		}
		for (AnnuncioSeed s : annunci) {
			Auto auto = new Auto();
			auto.setTitolo(s.titolo());
			auto.setDescrizione(s.descrizione());
			auto.setKm(s.km());
			auto.setCarburante(s.carburante());
			auto.setPrezzo(s.prezzo());
			auto.setCondizione(s.condizione());
			auto.setImmagini(s.immagini());
			auto.setStato(StatoAnnuncio.PUBBLICATO);
			autoRepository.save(auto);
		}
		log.info("[seed] caricati {} annunci di esempio", annunci.size());
	}
}
