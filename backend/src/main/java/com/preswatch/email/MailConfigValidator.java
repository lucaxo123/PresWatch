package com.preswatch.email;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class MailConfigValidator {

    private static final Logger log = LoggerFactory.getLogger(MailConfigValidator.class);
    private static final Set<String> LOCAL_HOSTS = Set.of("localhost", "127.0.0.1", "mailpit");

    @Value("${spring.mail.host:localhost}")
    private String mailHost;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:false}")
    private boolean starttlsEnabled;

    @PostConstruct
    void validate() {
        if (!LOCAL_HOSTS.contains(mailHost) && !starttlsEnabled) {
            throw new IllegalStateException(
                    "STARTTLS must be enabled (MAIL_SMTP_STARTTLS=true) when using a non-local SMTP host: " + mailHost
            );
        }
        log.info("Mail config validated: host={}, starttls={}", mailHost, starttlsEnabled);
    }
}
