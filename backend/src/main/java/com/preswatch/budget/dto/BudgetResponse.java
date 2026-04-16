package com.preswatch.budget.dto;

import java.math.BigDecimal;

public record BudgetResponse(
        Long id,
        BigDecimal amount,
        String month
) {}
