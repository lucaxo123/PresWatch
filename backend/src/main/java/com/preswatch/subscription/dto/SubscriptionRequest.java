package com.preswatch.subscription.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubscriptionRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull @Positive BigDecimal amount,
        @NotNull @Min(1) @Max(31) Integer billingDay,
        Long categoryId,
        @NotNull LocalDate startDate,
        LocalDate endDate
) {}
