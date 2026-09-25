package it.epicode.base.mail;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Locale;
import java.util.Map;

/**
 * Genera l'HTML delle mail con Thymeleaf (src/main/resources/templates/mail).
 * Nei template si usano solo th:text e th:href, che fanno l'escape: un utente
 * registrato come "<img src=x onerror=...>" arriva nella mail come testo.
 * th:utext (HTML grezzo) non va usato.
 */
@Component
public class MailTemplate {

	private final TemplateEngine templateEngine;

	public MailTemplate(TemplateEngine templateEngine) {
		this.templateEngine = templateEngine;
	}

	public String genera(String nomeTemplate, Map<String, Object> valori) {
		Context context = new Context(Locale.ITALY, valori);
		return templateEngine.process("mail/" + nomeTemplate, context);
	}
}
