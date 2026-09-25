package it.epicode.base;

import com.jayway.jsonpath.JsonPath;
import it.epicode.base.model.Ruolo;
import it.epicode.base.model.TokenPassword;
import it.epicode.base.repository.AvvisoRepository;
import it.epicode.base.repository.PreferitoRepository;
import it.epicode.base.repository.TokenPasswordRepository;
import it.epicode.base.repository.UtenteRepository;
import it.epicode.base.security.TokenCasuale;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifica le regole della nota sulla sicurezza passando da HTTP, come farebbe
 * il browser: DTO contro mass assignment, 403 sull'admin, 404 sulle risorse
 * altrui, ordinamento da whitelist, token monouso, escape nelle mail.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SicurezzaIntegrationTest {

	@Autowired
	MockMvc mvc;

	@Autowired
	UtenteRepository utenti;

	@Autowired
	PreferitoRepository preferiti;

	@Autowired
	AvvisoRepository avvisi;

	@Autowired
	TokenPasswordRepository tokenPassword;

	@MockitoBean
	JavaMailSender mailSender;

	String admin;

	@BeforeEach
	void prepara() throws Exception {
		when(mailSender.createMimeMessage()).thenAnswer(i -> new MimeMessage((Session) null));
		admin = login("admin@salone.local", "PasswordAdmin1");
	}

	// ---------- registrazione e JWT ----------

	@Test
	void registrazioneIgnoraRuoloEIdNelCorpo() throws Exception {
		String email = emailNuova();
		String token = JsonPath.read(mvc.perform(post("/api/auth/registrazione").contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"nome":"Mario","cognome":"Rossi","email":"%s","password":"Password123",
								 "ruolo":"ADMIN","id":1}""".formatted(email)))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString(), "$.token");

		assertThat(utenti.findByEmail(email).orElseThrow().getRuolo()).isEqualTo(Ruolo.USER);

		String payload = new String(Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);
		assertThat(payload).contains("\"ruolo\":\"USER\"").doesNotContain(email).doesNotContain("Mario");
	}

	@Test
	void profiloNonPermetteDiCambiareRuolo() throws Exception {
		String email = emailNuova();
		String utente = registra(email);
		mvc.perform(put("/api/me").header("Authorization", "Bearer " + utente).contentType(MediaType.APPLICATION_JSON)
						.content("{\"nome\":\"Luigi\",\"cognome\":\"Verdi\",\"ruolo\":\"ADMIN\",\"email\":\"x@y.it\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.nome").value("Luigi"))
				.andExpect(jsonPath("$.ruolo").value("USER"))
				.andExpect(jsonPath("$.email").value(email));
	}

	@Test
	void loginConPasswordSbagliataRisponde401Generico() throws Exception {
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"admin@salone.local\",\"password\":\"sbagliata1\"}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.messaggio").value("Credenziali non valide"));
	}

	// ---------- autorizzazioni admin ----------

	@Test
	void cambioPrezzoSoloAdmin() throws Exception {
		long autoId = creaAuto("Fiat Panda", 10000, 50000, "PUBBLICATO");
		String utente = registra(emailNuova());
		String corpo = "{\"prezzo\":9000}";

		mvc.perform(patch("/api/admin/auto/{id}/prezzo", autoId).contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isUnauthorized());
		mvc.perform(patch("/api/admin/auto/{id}/prezzo", autoId).header("Authorization", "Bearer " + utente)
						.contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isForbidden());
		mvc.perform(patch("/api/admin/auto/{id}/prezzo", autoId).header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.prezzo").value(9000));
	}

	// ---------- catalogo ----------

	@Test
	void bozzeInvisibiliAlPubblico() throws Exception {
		String titolo = "Bozza-" + UUID.randomUUID();
		long id = creaAuto(titolo, 12000, 1000, "BOZZA");
		mvc.perform(get("/api/auto/{id}", id)).andExpect(status().isNotFound());
		mvc.perform(get("/api/auto").param("q", titolo)).andExpect(jsonPath("$.totaleElementi").value(0));

		mvc.perform(post("/api/admin/auto/{id}/pubblica", id).header("Authorization", "Bearer " + admin))
				.andExpect(status().isOk());
		mvc.perform(get("/api/auto/{id}", id)).andExpect(status().isOk());
	}

	@Test
	void ordinamentoSoloDaWhitelist() throws Exception {
		mvc.perform(get("/api/auto").param("sort", "prezzo;drop table auto")).andExpect(status().isBadRequest());
		mvc.perform(get("/api/auto").param("sort", "passwordHash")).andExpect(status().isBadRequest());
		mvc.perform(get("/api/auto").param("sort", "prezzo").param("dir", "sideways")).andExpect(status().isBadRequest());
	}

	@Test
	void filtriOrdinamentoEPaginazione() throws Exception {
		String tag = "Serie-" + UUID.randomUUID().toString().substring(0, 8);
		creaAuto(tag + " A", 30000, 80000, "PUBBLICATO");
		creaAuto(tag + " B", 10000, 5000, "PUBBLICATO");
		creaAuto(tag + " C", 20000, 20000, "PUBBLICATO");

		mvc.perform(get("/api/auto").param("q", tag).param("sort", "prezzo").param("dir", "asc").param("size", "2"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.contenuto[*].titolo").value(contains(tag + " B", tag + " C")))
				.andExpect(jsonPath("$.totaleElementi").value(3))
				.andExpect(jsonPath("$.totalePagine").value(2));
		mvc.perform(get("/api/auto").param("q", tag).param("sort", "prezzo").param("dir", "asc")
						.param("size", "2").param("page", "1"))
				.andExpect(jsonPath("$.contenuto", hasSize(1)))
				.andExpect(jsonPath("$.contenuto[0].titolo").value(tag + " A"));

		mvc.perform(get("/api/auto").param("q", tag).param("kmMax", "25000").param("sort", "km").param("dir", "desc"))
				.andExpect(jsonPath("$.contenuto[*].titolo").value(contains(tag + " C", tag + " B")));

		mvc.perform(get("/api/auto").param("size", "500")).andExpect(status().isBadRequest());
		mvc.perform(get("/api/auto").param("page", "-1")).andExpect(status().isBadRequest());
	}

	@Test
	void ricercaTrattaCaratteriJollyComeTesto() throws Exception {
		mvc.perform(get("/api/auto").param("q", "%")).andExpect(jsonPath("$.totaleElementi").value(0));
	}

	@Test
	void immaginiSoloHttps() throws Exception {
		mvc.perform(post("/api/admin/auto").header("Authorization", "Bearer " + admin).contentType(MediaType.APPLICATION_JSON)
						.content(corpoAuto("X", 1000, 0, "BOZZA", "javascript:alert(1)")))
				.andExpect(status().isBadRequest());
	}

	// ---------- risorse altrui: 404 ----------

	@Test
	void preferitiEAvvisiAltruiRispondono404() throws Exception {
		long autoId = creaAuto("Golf", 20000, 30000, "PUBBLICATO");
		String anna = registra(emailNuova());
		String bruno = registra(emailNuova());

		long preferitoAnna = aggiungiPreferito(anna, autoId);
		long avvisoAnna = creaAvviso(anna, autoId, 18000);

		mvc.perform(get("/api/avvisi/{id}", avvisoAnna).header("Authorization", "Bearer " + bruno))
				.andExpect(status().isNotFound());
		mvc.perform(put("/api/avvisi/{id}", avvisoAnna).header("Authorization", "Bearer " + bruno)
						.contentType(MediaType.APPLICATION_JSON).content("{\"soglia\":1}"))
				.andExpect(status().isNotFound());
		mvc.perform(delete("/api/avvisi/{id}", avvisoAnna).header("Authorization", "Bearer " + bruno))
				.andExpect(status().isNotFound());
		mvc.perform(delete("/api/preferiti/{id}", preferitoAnna).header("Authorization", "Bearer " + bruno))
				.andExpect(status().isNotFound());

		assertThat(avvisi.findById(avvisoAnna)).isPresent();
		assertThat(preferiti.findById(preferitoAnna)).isPresent();
		mvc.perform(get("/api/avvisi/{id}", avvisoAnna).header("Authorization", "Bearer " + anna))
				.andExpect(status().isOk());
	}

	@Test
	void avvisoIgnoraUtenteIdEInviatoNelCorpo() throws Exception {
		long autoId = creaAuto("Punto", 8000, 90000, "PUBBLICATO");
		String email = emailNuova();
		String utente = registra(email);
		aggiungiPreferito(utente, autoId);
		String json = mvc.perform(post("/api/avvisi").header("Authorization", "Bearer " + utente)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"autoId\":%d,\"soglia\":7000,\"utenteId\":1,\"inviato\":true,\"attivo\":false}".formatted(autoId)))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		long id = ((Number) JsonPath.read(json, "$.id")).longValue();
		var avviso = avvisi.findById(id).orElseThrow();
		assertThat(avviso.isAttivo()).isTrue();
		assertThat(avviso.isInviato()).isFalse();
		assertThat(utenti.findByEmail(email).orElseThrow().getId())
				.isNotEqualTo(1L);
	}

	// ---------- avviso di prezzo e mail ----------

	@Test
	void caloPrezzoMandaUnaMailEscapataEDisattivazioneMonouso() throws Exception {
		long autoId = creaAuto("Auto <b>bella</b>", 15000, 10000, "PUBBLICATO");
		String email = emailNuova();
		String utente = registra(email, "<script>alert(1)</script>");
		aggiungiPreferito(utente, autoId);
		creaAvviso(utente, autoId, 14000);
		clearInvocations(mailSender);

		cambiaPrezzo(autoId, 14500);
		verify(mailSender, timeout(500).times(0)).send(any(MimeMessage.class));

		cambiaPrezzo(autoId, 13000);
		ArgumentCaptor<MimeMessage> mail = ArgumentCaptor.forClass(MimeMessage.class);
		verify(mailSender, timeout(3000)).send(mail.capture());
		String html = contenuto(mail.getValue());
		assertThat(html).contains("&lt;script&gt;alert(1)&lt;/script&gt;").doesNotContain("<script>");
		assertThat(html).contains("Auto &lt;b&gt;bella&lt;/b&gt;");

		// Secondo ribasso: stessa soglia gia' notificata, nessuna nuova mail.
		clearInvocations(mailSender);
		cambiaPrezzo(autoId, 12000);
		verify(mailSender, timeout(500).times(0)).send(any(MimeMessage.class));

		Matcher m = Pattern.compile("avvisi/disattiva\\?token=([A-Za-z0-9_-]+)").matcher(html);
		assertThat(m.find()).isTrue();
		String token = m.group(1);
		mvc.perform(post("/api/avvisi/disattiva").contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"" + token + "\"}"))
				.andExpect(status().isNoContent());
		mvc.perform(post("/api/avvisi/disattiva").contentType(MediaType.APPLICATION_JSON).content("{\"token\":\"" + token + "\"}"))
				.andExpect(status().isNotFound());
	}

	// ---------- reset password ----------

	@Test
	void resetPasswordMonousoEConScadenza() throws Exception {
		String email = emailNuova();
		registra(email);
		clearInvocations(mailSender);

		mvc.perform(post("/api/auth/password-dimenticata").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"" + email + "\"}"))
				.andExpect(status().isNoContent());
		ArgumentCaptor<MimeMessage> mail = ArgumentCaptor.forClass(MimeMessage.class);
		verify(mailSender, timeout(3000)).send(mail.capture());
		Matcher m = Pattern.compile("reimposta-password\\?token=([A-Za-z0-9_-]+)").matcher(contenuto(mail.getValue()));
		assertThat(m.find()).isTrue();
		String token = m.group(1);

		String corpo = "{\"token\":\"" + token + "\",\"nuovaPassword\":\"NuovaPassword1\"}";
		mvc.perform(post("/api/auth/reimposta-password").contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isNoContent());
		mvc.perform(post("/api/auth/reimposta-password").contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isBadRequest());
		login(email, "NuovaPassword1");

		// Token scaduto: creato con scadenza nel passato.
		String scaduto = TokenCasuale.genera();
		tokenPassword.save(new TokenPassword(utenti.findByEmail(email).orElseThrow(), TokenCasuale.hash(scaduto),
				Instant.now().minusSeconds(1)));
		mvc.perform(post("/api/auth/reimposta-password").contentType(MediaType.APPLICATION_JSON)
						.content("{\"token\":\"" + scaduto + "\",\"nuovaPassword\":\"AltraPassword1\"}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void passwordDimenticataNonRivelaSeLEmailEsiste() throws Exception {
		clearInvocations(mailSender);
		mvc.perform(post("/api/auth/password-dimenticata").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"nessuno@esempio.it\"}"))
				.andExpect(status().isNoContent());
		verify(mailSender, timeout(500).times(0)).send(any(MimeMessage.class));
		verify(mailSender, never()).send(any(MimeMessage.class));
	}

	// ---------- helper ----------

	private String emailNuova() {
		return "u" + UUID.randomUUID().toString().substring(0, 8) + "@esempio.it";
	}

	private String registra(String email) throws Exception {
		return registra(email, "Mario");
	}

	private String registra(String email, String nome) throws Exception {
		String corpo = "{\"nome\":%s,\"cognome\":\"Rossi\",\"email\":\"%s\",\"password\":\"Password123\"}"
				.formatted(jsonString(nome), email);
		return JsonPath.read(mvc.perform(post("/api/auth/registrazione").contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString(), "$.token");
	}

	private String login(String email, String password) throws Exception {
		return JsonPath.read(mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password)))
				.andExpect(status().isOk()).andReturn().getResponse().getContentAsString(), "$.token");
	}

	private long creaAuto(String titolo, int prezzo, int km, String stato) throws Exception {
		String json = mvc.perform(post("/api/admin/auto").header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON)
						.content(corpoAuto(titolo, prezzo, km, stato, "https://esempio.it/a.jpg")))
				.andExpect(status().isCreated())
				.andReturn().getResponse().getContentAsString();
		return ((Number) JsonPath.read(json, "$.id")).longValue();
	}

	private String corpoAuto(String titolo, int prezzo, int km, String stato, String immagine) {
		return """
				{"titolo":%s,"descrizione":"Descrizione","km":%d,"carburante":"BENZINA","prezzo":%d,
				 "condizione":"USATO","immagini":["%s"],"stato":"%s"}""".formatted(jsonString(titolo), km, prezzo, immagine, stato);
	}

	private long aggiungiPreferito(String token, long autoId) throws Exception {
		String json = mvc.perform(post("/api/preferiti").header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON).content("{\"autoId\":" + autoId + "}"))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		return ((Number) JsonPath.read(json, "$.id")).longValue();
	}

	private long creaAvviso(String token, long autoId, int soglia) throws Exception {
		String json = mvc.perform(post("/api/avvisi").header("Authorization", "Bearer " + token)
						.contentType(MediaType.APPLICATION_JSON)
						.content("{\"autoId\":%d,\"soglia\":%d}".formatted(autoId, soglia)))
				.andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
		return ((Number) JsonPath.read(json, "$.id")).longValue();
	}

	private ResultActions cambiaPrezzo(long autoId, int prezzo) throws Exception {
		return mvc.perform(patch("/api/admin/auto/{id}/prezzo", autoId).header("Authorization", "Bearer " + admin)
						.contentType(MediaType.APPLICATION_JSON).content("{\"prezzo\":" + prezzo + "}"))
				.andExpect(status().isOk());
	}

	private static String contenuto(MimeMessage messaggio) throws Exception {
		return messaggio.getContent().toString();
	}

	private static String jsonString(String s) {
		return "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
	}
}
