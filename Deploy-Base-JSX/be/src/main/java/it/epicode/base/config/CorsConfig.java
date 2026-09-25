package it.epicode.base.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;

/**
 * In produzione FE e BE stanno su due domini diversi: senza CORS il browser
 * blocca ogni fetch. Le origini ammesse arrivano da ALLOWED_ORIGIN.
 *
 * E' un CorsConfigurationSource perche' con Spring Security il CORS va
 * applicato dalla catena dei filtri, prima dell'autenticazione (vedi
 * SecurityConfig).
 */
@Configuration
public class CorsConfig {

	@Bean
	CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins}") List<String> origini) {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(origini.stream().map(String::trim).toList());
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
		config.setMaxAge(Duration.ofHours(1));

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/api/**", config);
		return source;
	}
}
