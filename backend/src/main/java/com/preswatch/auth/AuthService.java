package com.preswatch.auth;

import com.preswatch.auth.dto.AuthResponse;
import com.preswatch.auth.dto.LoginRequest;
import com.preswatch.auth.dto.RegisterRequest;
import com.preswatch.common.BadRequestException;
import com.preswatch.user.User;
import com.preswatch.user.UserRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    static final String REFRESH_COOKIE_NAME = "refresh_token";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenBlacklistService tokenBlacklistService;

    @Value("${app.refresh-token.expiration-days:30}")
    private int refreshTokenExpirationDays;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Strict}")
    private String cookieSameSite;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletResponse response) {
        String email = request.email().trim().toLowerCase();
        String username = request.username().trim();

        if (userRepository.existsByEmail(email) || userRepository.existsByUsername(username)) {
            throw new BadRequestException("El email o nombre de usuario ya está en uso");
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .build();

        user = userRepository.save(user);
        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletResponse response) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Email o contraseña incorrectos");
        }

        return issueTokens(user, response);
    }

    @Transactional
    public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
        String rawToken = extractRefreshCookie(request)
                .orElseThrow(() -> new BadRequestException("Refresh token no encontrado"));

        RefreshToken refreshToken = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new BadRequestException("Refresh token inválido"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            clearRefreshCookie(response);
            throw new BadRequestException("Sesión expirada, por favor iniciá sesión nuevamente");
        }

        // Rotate: delete old, issue new
        refreshTokenRepository.delete(refreshToken);
        return issueTokens(refreshToken.getUser(), response);
    }

    @Transactional
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        // Blacklist current access token if present
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String accessToken = authHeader.substring(7);
            try {
                String jti = jwtService.extractJti(accessToken);
                long expiresAt = jwtService.extractExpirationMs(accessToken);
                tokenBlacklistService.revoke(jti, expiresAt);
            } catch (Exception ignored) {
                // Token already invalid — proceed with logout anyway
            }
        }

        // Delete refresh token from DB and clear cookie
        extractRefreshCookie(request).ifPresent(token ->
                refreshTokenRepository.findByToken(token)
                        .ifPresent(refreshTokenRepository::delete)
        );
        clearRefreshCookie(response);
    }

    private AuthResponse issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateToken(user);

        String rawRefreshToken = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(rawRefreshToken)
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(refreshTokenExpirationDays))
                .build();
        refreshTokenRepository.save(refreshToken);

        setRefreshCookie(response, rawRefreshToken);
        return new AuthResponse(accessToken, user.getId(), user.getEmail(), user.getUsername());
    }

    private void setRefreshCookie(HttpServletResponse response, String token) {
        String cookieValue = String.format(
                "%s=%s; Path=/api/auth; HttpOnly; Max-Age=%d%s; SameSite=%s",
                REFRESH_COOKIE_NAME,
                token,
                refreshTokenExpirationDays * 24 * 60 * 60,
                cookieSecure ? "; Secure" : "",
                cookieSameSite
        );
        response.addHeader("Set-Cookie", cookieValue);
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        String cookieValue = String.format(
                "%s=; Path=/api/auth; HttpOnly; Max-Age=0%s; SameSite=%s",
                REFRESH_COOKIE_NAME,
                cookieSecure ? "; Secure" : "",
                cookieSameSite
        );
        response.addHeader("Set-Cookie", cookieValue);
    }

    private java.util.Optional<String> extractRefreshCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return java.util.Optional.empty();
        return Arrays.stream(request.getCookies())
                .filter(c -> REFRESH_COOKIE_NAME.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        refreshTokenRepository.deleteExpired(OffsetDateTime.now());
    }
}
