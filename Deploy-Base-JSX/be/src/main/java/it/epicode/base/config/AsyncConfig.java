package it.epicode.base.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/** Abilita @Async: le mail partono in un thread separato dalla richiesta. */
@Configuration
@EnableAsync
public class AsyncConfig {
}
