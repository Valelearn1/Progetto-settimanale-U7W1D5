package it.epicode.base.mail;

import it.epicode.base.model.Utente;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.Duration;
import java.util.Locale;
import java.util.Map;

/**
 * Invio delle mail. Nei log non finiscono mai l'indirizzo del destinatario ne'
 * il contenuto; il link si stampa solo con app.mail.log-link=true, per provare
 * in locale senza SMTP.
 */
@Service
public class MailService {

	private static final Logger log = LoggerFactory.getLogger(MailService.class);

	private final JavaMailSender sender;
	private final MailTemplate template;
	private final String mittente;
	private final String feUrl;
	private final boolean configurato;
	private final boolean logLink;

	public MailService(JavaMailSender sender, MailTemplate template,
					   @Value("${spring.mail.username:}") String username,
					   @Value("${app.mail.mittente}") String mittente,
					   @Value("${app.fe-url}") String feUrl,
					   @Value("${app.mail.log-link:false}") boolean logLink) {
		this.sender = sender;
		this.template = template;
		this.mittente = mittente;
		this.feUrl = feUrl.replaceAll("/+$", "");
		this.configurato = username != null && !username.isBlank();
		this.logLink = logLink;
	}

	public void inviaResetPassword(Utente utente, String token, Duration durata) {
		String link = feUrl + "/reimposta-password?token=" + codifica(token);
		String html = template.genera("reset-password.html", Map.of(
				"nome", utente.getNome(),
				"link", link,
				"durata", durata.toMinutes() + " minuti"));
		invia(utente.getEmail(), "Reimposta la password", html, "reset-password", link);
	}

	/** Dati gia' letti dal database: la mail si compone fuori dalla transazione. */
	public record DatiAvvisoPrezzo(String email, String nome, Long autoId, String titolo,
								   BigDecimal prezzo, BigDecimal soglia, String token) {
	}

	public void inviaAvvisoPrezzo(DatiAvvisoPrezzo d) {
		String linkDisattiva = feUrl + "/avvisi/disattiva?token=" + codifica(d.token());
		String html = template.genera("avviso-prezzo.html", Map.of(
				"nome", d.nome(),
				"titolo", d.titolo(),
				"prezzo", euro(d.prezzo()),
				"soglia", euro(d.soglia()),
				"linkAuto", feUrl + "/auto/" + d.autoId(),
				"linkDisattiva", linkDisattiva));
		invia(d.email(), "Il prezzo di un'auto che segui e' sceso", html, "avviso-prezzo", linkDisattiva);
	}

	private void invia(String destinatario, String oggetto, String html, String tipo, String link) {
		if (!configurato) {
			log.info("[mail] SMTP non configurato, mail {} non inviata", tipo);
			if (logLink) {
				log.info("[mail] link {} (solo sviluppo): {}", tipo, link);
			}
			return;
		}
		try {
			MimeMessage messaggio = sender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(messaggio, StandardCharsets.UTF_8.name());
			helper.setFrom(mittente);
			helper.setTo(destinatario);
			helper.setSubject(oggetto);
			helper.setText(html, true);
			sender.send(messaggio);
			log.info("[mail] mail {} inviata", tipo);
		} catch (Exception e) {
			// Solo il tipo di errore: il messaggio di JavaMail puo' contenere l'indirizzo.
			log.warn("[mail] invio {} fallito: {}", tipo, e.getClass().getSimpleName());
		}
	}

	private static String codifica(String valore) {
		return URLEncoder.encode(valore, StandardCharsets.UTF_8);
	}

	private static String euro(BigDecimal importo) {
		return NumberFormat.getCurrencyInstance(Locale.ITALY).format(importo);
	}
}
