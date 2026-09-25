package it.epicode.base;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Limiti di tentativi con valori bassi (contesto separato dagli altri test). */
@SpringBootTest(properties = {
		"app.limiti.login-errati-per-email=3",
		"app.limiti.reset-per-email=2",
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LimitiIntegrationTest {

	@Autowired
	MockMvc mvc;

	@Test
	void loginBloccatoDopoTroppiErroriSullaStessaEmail() throws Exception {
		String email = "u" + UUID.randomUUID().toString().substring(0, 8) + "@esempio.it";
		mvc.perform(post("/api/auth/registrazione").contentType(MediaType.APPLICATION_JSON)
						.content("{\"nome\":\"A\",\"cognome\":\"B\",\"email\":\"" + email + "\",\"password\":\"Password123\"}"))
				.andExpect(status().isCreated());
		String sbagliata = "{\"email\":\"" + email + "\",\"password\":\"Sbagliata99\"}";
		for (int i = 0; i < 3; i++) {
			mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(sbagliata))
					.andExpect(status().isUnauthorized());
		}
		// Anche con la password giusta: l'email e' bloccata per 15 minuti.
		mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
						.content("{\"email\":\"" + email + "\",\"password\":\"Password123\"}"))
				.andExpect(status().isTooManyRequests())
				.andExpect(header().exists("Retry-After"));
	}

	@Test
	void resetPasswordLimitatoPerEmail() throws Exception {
		String corpo = "{\"email\":\"limite-" + UUID.randomUUID().toString().substring(0, 6) + "@esempio.it\"}";
		for (int i = 0; i < 2; i++) {
			mvc.perform(post("/api/auth/password-dimenticata").contentType(MediaType.APPLICATION_JSON).content(corpo))
					.andExpect(status().isNoContent());
		}
		mvc.perform(post("/api/auth/password-dimenticata").contentType(MediaType.APPLICATION_JSON).content(corpo))
				.andExpect(status().isTooManyRequests());
	}
}
