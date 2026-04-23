package com.preswatch.card.dto;

import java.time.OffsetDateTime;

public record CardResponse(
        Long id,
        String bank,
        String last4,
        String color,
        OffsetDateTime createdAt
) {}
