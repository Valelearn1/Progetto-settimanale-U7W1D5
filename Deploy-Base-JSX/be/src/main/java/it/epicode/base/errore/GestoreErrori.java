package it.epicode.base.errore;

import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.List;

/**
 * Traduce le eccezioni in risposte JSON. Nei dettagli compaiono il nome del
 * campo e il messaggio, mai il valore ricevuto: potrebbe essere una password.
 */
@RestControllerAdvice
public class GestoreErrori {

	private static final Logger log = LoggerFactory.getLogger(GestoreErrori.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	ResponseEntity<Errore> validazione(MethodArgumentNotValidException e) {
		List<String> dettagli = e.getBindingResult().getFieldErrors().stream()
				.map(f -> f.getField() + ": " + f.getDefaultMessage())
				.sorted()
				.toList();
		return risposta(HttpStatus.BAD_REQUEST, "Dati non validi", dettagli);
	}

	@ExceptionHandler(HandlerMethodValidationException.class)
	ResponseEntity<Errore> validazioneParametri(HandlerMethodValidationException e) {
		List<String> dettagli = e.getParameterValidationResults().stream()
				.flatMap(r -> r.getResolvableErrors().stream()
						.map(err -> r.getMethodParameter().getParameterName() + ": " + err.getDefaultMessage()))
				.sorted()
				.toList();
		return risposta(HttpStatus.BAD_REQUEST, "Parametri non validi", dettagli);
	}

	@ExceptionHandler(ConstraintViolationException.class)
	ResponseEntity<Errore> vincoli(ConstraintViolationException e) {
		return risposta(HttpStatus.BAD_REQUEST, "Parametri non validi", List.of());
	}

	@ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class,
			MissingServletRequestParameterException.class})
	ResponseEntity<Errore> formato(Exception e) {
		return risposta(HttpStatus.BAD_REQUEST, "Richiesta non leggibile", List.of());
	}

	@ExceptionHandler(RichiestaNonValidaException.class)
	ResponseEntity<Errore> nonValida(RichiestaNonValidaException e) {
		return risposta(HttpStatus.BAD_REQUEST, e.getMessage(), List.of());
	}

	@ExceptionHandler(CredenzialiNonValideException.class)
	ResponseEntity<Errore> credenziali(CredenzialiNonValideException e) {
		return risposta(HttpStatus.UNAUTHORIZED, e.getMessage(), List.of());
	}

	@ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
	ResponseEntity<Errore> vietato(Exception e) {
		return risposta(HttpStatus.FORBIDDEN, "Accesso negato", List.of());
	}

	@ExceptionHandler({NonTrovatoException.class, NoResourceFoundException.class})
	ResponseEntity<Errore> nonTrovato(Exception e) {
		return risposta(HttpStatus.NOT_FOUND, "Risorsa non trovata", List.of());
	}

	@ExceptionHandler(ConflittoException.class)
	ResponseEntity<Errore> conflitto(ConflittoException e) {
		return risposta(HttpStatus.CONFLICT, e.getMessage(), List.of());
	}

	/** Due richieste in parallelo che violano un vincolo unique. */
	@ExceptionHandler(DataIntegrityViolationException.class)
	ResponseEntity<Errore> integrita(DataIntegrityViolationException e) {
		return risposta(HttpStatus.CONFLICT, "Operazione in conflitto con i dati esistenti", List.of());
	}

	@ExceptionHandler(Exception.class)
	ResponseEntity<Errore> generico(Exception e) {
		// Solo il tipo: il messaggio potrebbe contenere dati della richiesta.
		log.error("Errore non gestito: {}", e.getClass().getName());
		return risposta(HttpStatus.INTERNAL_SERVER_ERROR, "Errore interno", List.of());
	}

	private static ResponseEntity<Errore> risposta(HttpStatus stato, String messaggio, List<String> dettagli) {
		return ResponseEntity.status(stato).body(new Errore(stato.value(), messaggio, dettagli));
	}
}
