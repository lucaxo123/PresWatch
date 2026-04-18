package com.preswatch.auth;

import com.preswatch.auth.dto.AuthResponse;
import com.preswatch.auth.dto.LoginRequest;
import com.preswatch.auth.dto.RegisterRequest;
import com.preswatch.common.BadRequestException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.user.User;
import com.preswatch.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
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
        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Email o contraseña incorrectos");
        }

        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    public AuthResponse refreshForCurrentUser() {
        User user = SecurityUtils.getCurrentUser();
        String token = jwtService.generateToken(user);
        return toResponse(token, user);
    }

    private AuthResponse toResponse(String token, User user) {
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername());
    }
}
