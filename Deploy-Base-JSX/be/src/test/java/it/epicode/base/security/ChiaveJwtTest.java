package it.epicode.base.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** La chiave JWT di sviluppo e' ammessa in locale ma non in produzione. */
class ChiaveJwtTest {

	private final SecurityConfig config = new SecurityConfig();
	private final String chiaveSviluppo = "solo-per-sviluppo-locale-cambiami-0123456789abcdef";

	@Test
	void chiaveDiSviluppoAmmessaInLocale() {
		assertThatCode(() -> config.chiaveJwt(chiaveSviluppo, false)).doesNotThrowAnyException();
	}

	@Test
	void chiaveDiSviluppoVietataInProduzione() {
		assertThatThrownBy(() -> config.chiaveJwt(chiaveSviluppo, true))
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("JWT_SECRET");
	}

	@Test
	void chiaveTroppoCortaRifiutata() {
		assertThatThrownBy(() -> config.chiaveJwt("corta", false)).isInstanceOf(IllegalStateException.class);
	}
}
