package com.preswatch.email;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@preswatch.app}")
    private String fromAddress;

    public void sendPasswordResetEmail(String to, String resetLink, int expirationMinutes) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject("Recuperación de contraseña — PresWatch");

            String htmlBody = """
                    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                      <h2 style="color: #1c1917; margin-bottom: 8px;">Recuperá tu contraseña</h2>
                      <p style="color: #57534e; margin-bottom: 24px;">
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en PresWatch.
                        Si no fuiste vos, podés ignorar este correo.
                      </p>
                      <a href="%s"
                         style="display: inline-block; background-color: #d97706; color: #ffffff;
                                padding: 12px 24px; border-radius: 8px; text-decoration: none;
                                font-weight: 600; font-size: 14px;">
                        Restablecer contraseña
                      </a>
                      <p style="color: #a8a29e; font-size: 12px; margin-top: 24px;">
                        Este link es válido por %d minutos y puede usarse una sola vez.
                      </p>
                    </div>
                    """.formatted(resetLink, expirationMinutes);

            String textBody = """
                    Recuperá tu contraseña en PresWatch

                    Recibimos una solicitud para restablecer la contraseña de tu cuenta.
                    Si no fuiste vos, podés ignorar este correo.

                    Hacé clic en el siguiente link para restablecer tu contraseña:
                    %s

                    Este link es válido por %d minutos y puede usarse una sola vez.
                    """.formatted(resetLink, expirationMinutes);

            helper.setText(textBody, htmlBody);
            mailSender.send(message);
        } catch (MessagingException ex) {
            log.error("Failed to send password reset email: {}", ex.getMessage());
            throw new EmailDeliveryException("Failed to send password reset email", ex);
        }
    }
}
