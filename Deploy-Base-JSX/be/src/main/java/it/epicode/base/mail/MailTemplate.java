package it.epicode.base.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.util.HtmlUtils;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Template HTML delle mail (src/main/resources/mail). I segnaposto {{nome}}
 * vengono sostituiti con il valore passato DOPO l'escape HTML: non esiste un
 * modo per inserire HTML grezzo. Un utente registrato come
 * "<img src=x onerror=...>" arriva nella mail come testo.
 */
@Component
public class MailTemplate {

	private static final Pattern SEGNAPOSTO = Pattern.compile("\\{\\{(\\w+)}}");

	private final Map<String, String> cache = new ConcurrentHashMap<>();

	public String genera(String nomeTemplate, Map<String, String> valori) {
		String template = cache.computeIfAbsent(nomeTemplate, MailTemplate::carica);
		Matcher m = SEGNAPOSTO.matcher(template);
		StringBuilder sb = new StringBuilder();
		while (m.find()) {
			String chiave = m.group(1);
			String valore = valori.get(chiave);
			if (valore == null) {
				throw new IllegalArgumentException("Valore mancante per il segnaposto " + chiave);
			}
			m.appendReplacement(sb, Matcher.quoteReplacement(HtmlUtils.htmlEscape(valore, StandardCharsets.UTF_8.name())));
		}
		m.appendTail(sb);
		return sb.toString();
	}

	private static String carica(String nome) {
		try {
			return new ClassPathResource("mail/" + nome).getContentAsString(StandardCharsets.UTF_8);
		} catch (IOException e) {
			throw new UncheckedIOException(e);
		}
	}
}
