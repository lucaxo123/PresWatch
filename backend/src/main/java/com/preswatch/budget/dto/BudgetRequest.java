package com.preswatch.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record BudgetRequest(
        @NotNull @Positive BigDecimal amount,
        @NotBlank @Pattern(regexp = "^\\d{4}-\\d{2}$", message = "Month must be in YYYY-MM format") String month
) {}
