package com.preswatch.expense.dto;

import com.preswatch.category.dto.CategoryResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record ExpenseResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate expenseDate,
        CategoryResponse category,
        OffsetDateTime createdAt
) {}
