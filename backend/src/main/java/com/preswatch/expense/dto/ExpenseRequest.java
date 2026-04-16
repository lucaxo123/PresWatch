package com.preswatch.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull @Positive BigDecimal amount,
        Long categoryId,
        String description,
        @NotNull @PastOrPresent LocalDate expenseDate
) {}
