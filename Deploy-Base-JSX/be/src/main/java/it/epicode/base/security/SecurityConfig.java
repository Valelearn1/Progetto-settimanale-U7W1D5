package it.epicode.base.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Chi puo' chiamare cosa. Il client manda il JWT nell'header Authorization:
 * niente cookie di sessione, quindi niente CSRF.
 *
 * Le regole sugli indirizzi sono la prima difesa; i controller admin hanno
 * anche @PreAuthorize, cosi' un errore qui non basta ad aprirli.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

	@Bean
	SecurityFilterChain filtri(HttpSecurity http, JwtAuthenticationConverter jwtConverter) throws Exception {
		http
				.csrf(csrf -> csrf.disable())
				.cors(Customizer.withDefaults())
				.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.httpBasic(b -> b.disable())
				.formLogin(f -> f.disable())
				.authorizeHttpRequests(a -> a
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auto", "/api/auto/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/avvisi/disattiva").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/stato", "/actuator/health", "/actuator/health/**").permitAll()
						.requestMatchers("/error").permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.anyRequest().authenticated())
				.oauth2ResourceServer(o -> o
						.jwt(j -> j.jwtAuthenticationConverter(jwtConverter))
						.authenticationEntryPoint(nonAutenticato())
						.accessDeniedHandler(vietato()))
				.exceptionHandling(e -> e
						.authenticationEntryPoint(nonAutenticato())
						.accessDeniedHandler(vietato()));
		return http.build();
	}

	@Bean
	SecretKey chiaveJwt(@Value("${app.jwt.secret}") String segreto) {
		byte[] byteChiave = segreto.getBytes(StandardCharsets.UTF_8);
		if (byteChiave.length < 32) {
			// HS256 richiede almeno 256 bit: meglio non partire che firmare male.
			throw new IllegalStateException("JWT_SECRET deve essere lunga almeno 32 byte");
		}
		return new SecretKeySpec(byteChiave, "HmacSHA256");
	}

	@Bean
	JwtEncoder jwtEncoder(SecretKey chiave) {
		return new NimbusJwtEncoder(new ImmutableSecret<>(chiave));
	}

	@Bean
	JwtDecoder jwtDecoder(SecretKey chiave) {
		return NimbusJwtDecoder.withSecretKey(chiave).macAlgorithm(MacAlgorithm.HS256).build();
	}

	/** Claim "ruolo" -> ROLE_USER / ROLE_ADMIN. */
	@Bean
	JwtAuthenticationConverter jwtAuthenticationConverter() {
		JwtGrantedAuthoritiesConverter ruoli = new JwtGrantedAuthoritiesConverter();
		ruoli.setAuthoritiesClaimName(JwtService.CLAIM_RUOLO);
		ruoli.setAuthorityPrefix("ROLE_");
		JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
		converter.setJwtGrantedAuthoritiesConverter(ruoli);
		return converter;
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	private static AuthenticationEntryPoint nonAutenticato() {
		return (request, response, e) -> scrivi(response, HttpServletResponse.SC_UNAUTHORIZED, "Autenticazione richiesta");
	}

	private static AccessDeniedHandler vietato() {
		return (request, response, e) -> scrivi(response, HttpServletResponse.SC_FORBIDDEN, "Accesso negato");
	}

	private static void scrivi(HttpServletResponse response, int stato, String messaggio) throws IOException {
		response.setStatus(stato);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding(StandardCharsets.UTF_8.name());
		response.getWriter().write("{\"stato\":" + stato + ",\"messaggio\":\"" + messaggio + "\",\"dettagli\":[]}");
	}
}
