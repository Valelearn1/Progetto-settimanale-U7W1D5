package it.epicode.base.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * @Async: le mail partono in un thread separato dalla richiesta.
 * @Scheduled: lavori periodici (pulizia dei token di reset).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
}
