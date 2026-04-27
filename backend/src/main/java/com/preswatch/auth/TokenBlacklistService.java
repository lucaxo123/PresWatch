package com.preswatch.auth;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenBlacklistService {

    // Maps JTI → expiry epoch millis
    private final ConcurrentHashMap<String, Long> blacklist = new ConcurrentHashMap<>();

    public void revoke(String jti, long expiresAtMs) {
        blacklist.put(jti, expiresAtMs);
    }

    public boolean isRevoked(String jti) {
        Long expiresAt = blacklist.get(jti);
        if (expiresAt == null) return false;
        if (System.currentTimeMillis() > expiresAt) {
            blacklist.remove(jti);
            return false;
        }
        return true;
    }

    @Scheduled(fixedRate = 3_600_000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        blacklist.entrySet().removeIf(entry -> now > entry.getValue());
    }
}
