package com.preswatch.subscription.dto;

import com.preswatch.category.dto.CategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record SubscriptionResponse(
        Long id,
        String name,
        BigDecimal amount,
        int billingDay,
        boolean active,
        LocalDate startDate,
        LocalDate endDate,
        CategoryResponse category,
        OffsetDateTime createdAt
) {}
