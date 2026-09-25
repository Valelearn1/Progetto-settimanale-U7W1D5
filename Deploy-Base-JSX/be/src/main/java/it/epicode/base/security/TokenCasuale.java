package it.epicode.base.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Token per i link nelle mail (reset password, disattivazione avviso).
 * 32 byte casuali: impossibili da indovinare, a differenza di un id.
 * Nel database finisce solo lo SHA-256.
 */
public final class TokenCasuale {

	private static final SecureRandom RANDOM = new SecureRandom();

	private TokenCasuale() {
	}

	public static String genera() {
		byte[] byteCasuali = new byte[32];
		RANDOM.nextBytes(byteCasuali);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(byteCasuali);
	}

	public static String hash(String token) {
		try {
			MessageDigest sha = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(sha.digest(token.getBytes(StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}
}
