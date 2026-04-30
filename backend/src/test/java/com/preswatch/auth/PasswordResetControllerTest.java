package com.preswatch.auth;

import com.preswatch.IntegrationTestBase;
import com.preswatch.auth.passwordreset.PasswordResetToken;
import com.preswatch.auth.passwordreset.PasswordResetTokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PasswordResetControllerTest extends IntegrationTestBase {

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Test
    void forgotPasswordWithExistingEmailReturns200AndPersistsToken() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"test@preswatch.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());

        long tokenCount = passwordResetTokenRepository.findAll().stream()
                .filter(t -> t.getUserId().equals(testUser.getId()))
                .count();
        assertEquals(1, tokenCount, "A reset token must be persisted for the existing user");
    }

    @Test
    void forgotPasswordWithNonExistentEmailReturns200WithoutToken() throws Exception {
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ghost@nowhere.com"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());

        assertEquals(0, passwordResetTokenRepository.count(), "No token must be persisted for unknown email");
    }

    @Test
    void resetPasswordWithValidTokenUpdatesPasswordAndInvalidatesRefreshTokens() throws Exception {
        String rawToken = "test-valid-token-abcdefghijklmnopqrstuvwxyz01";
        String tokenHash = sha256Base64(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(testUser.getId())
                .tokenHash(tokenHash)
                .expiresAt(OffsetDateTime.now().plusMinutes(60))
                .build();
        passwordResetTokenRepository.save(resetToken);

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"NewPass1234!"}
                                """.formatted(rawToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").isNotEmpty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"test@preswatch.com","password":"NewPass1234!"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"test@preswatch.com","password":"Test1234!"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPasswordWithAlreadyUsedTokenReturns400() throws Exception {
        String rawToken = "single-use-token-abcdefghijklmnopqrstuvwxyz0123";
        String tokenHash = sha256Base64(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(testUser.getId())
                .tokenHash(tokenHash)
                .expiresAt(OffsetDateTime.now().plusMinutes(60))
                .build();
        passwordResetTokenRepository.save(resetToken);

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"NewPass1234!"}
                                """.formatted(rawToken)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"AnotherPass5678!"}
                                """.formatted(rawToken)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void resetPasswordWithInvalidOrExpiredTokenReturns400() throws Exception {
        String expiredRawToken = "expired-token-abcdefghijklmnopqrstuvwxyz01234";
        String expiredTokenHash = sha256Base64(expiredRawToken);

        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .userId(testUser.getId())
                .tokenHash(expiredTokenHash)
                .expiresAt(OffsetDateTime.now().minusMinutes(1))
                .build();
        passwordResetTokenRepository.save(expiredToken);

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"%s","newPassword":"NewPass1234!"}
                                """.formatted(expiredRawToken)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"token":"completely-invalid-token-xyz","newPassword":"NewPass1234!"}
                                """))
                .andExpect(status().isBadRequest());
    }

    private String sha256Base64(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
