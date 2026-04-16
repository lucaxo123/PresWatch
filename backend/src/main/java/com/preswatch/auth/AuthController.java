package com.preswatch.auth;

import com.preswatch.auth.dto.AuthResponse;
import com.preswatch.auth.dto.LoginRequest;
import com.preswatch.auth.dto.RegisterRequest;
import com.preswatch.common.SecurityUtils;
import com.preswatch.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me() {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "username", user.getUsername()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh() {
        return ResponseEntity.ok(authService.refreshForCurrentUser());
    }
}
