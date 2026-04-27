package com.preswatch.expense.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull @Positive BigDecimal amount,
        Long categoryId,
        @Size(max = 500, message = "La descripción no puede superar los 500 caracteres") String description,
        @NotNull @PastOrPresent LocalDate expenseDate
) {}
