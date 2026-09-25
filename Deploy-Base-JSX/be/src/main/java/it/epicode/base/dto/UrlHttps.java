package it.epicode.base.dto;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.net.URI;
import java.util.Locale;

/**
 * Indirizzo assoluto https. Le immagini finiscono in un attributo src: cosi'
 * non passano javascript:, data: o indirizzi relativi.
 */
@Target({ElementType.TYPE_USE, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UrlHttps.Validatore.class)
public @interface UrlHttps {

	String message() default "deve essere un indirizzo https valido";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};

	class Validatore implements ConstraintValidator<UrlHttps, String> {

		@Override
		public boolean isValid(String valore, ConstraintValidatorContext context) {
			if (valore == null) {
				return true;
			}
			try {
				URI uri = new URI(valore.trim());
				return uri.isAbsolute()
						&& "https".equals(uri.getScheme().toLowerCase(Locale.ROOT))
						&& uri.getHost() != null
						&& uri.getUserInfo() == null;
			} catch (Exception e) {
				return false;
			}
		}
	}
}
