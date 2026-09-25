package it.epicode.base.service;

import it.epicode.base.mail.MailService;
import it.epicode.base.repository.UtenteRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Riceve gli eventi solo dopo il commit (AFTER_COMMIT) e lavora in un altro
 * thread (@Async): la risposta HTTP non aspetta il server SMTP.
 */
@Component
public class NotificheListener {

	private final AvvisoService avvisoService;
	private final UtenteRepository utenti;
	private final MailService mail;
	private final AuthService authService;

	public NotificheListener(AvvisoService avvisoService, UtenteRepository utenti, MailService mail, AuthService authService) {
		this.avvisoService = avvisoService;
		this.utenti = utenti;
		this.mail = mail;
		this.authService = authService;
	}

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void prezzoCambiato(Eventi.PrezzoCambiato evento) {
		avvisoService.controllaPrezzo(evento.autoId());
	}

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void resetRichiesto(Eventi.ResetRichiesto evento) {
		utenti.findById(evento.utenteId())
				.ifPresent(u -> mail.inviaResetPassword(u, evento.token(), authService.getDurataReset()));
	}
}
