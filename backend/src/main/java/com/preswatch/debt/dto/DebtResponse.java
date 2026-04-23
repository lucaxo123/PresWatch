package com.preswatch.debt.dto;

import com.preswatch.card.dto.CardResponse;
import com.preswatch.category.dto.CategoryResponse;
import com.preswatch.debt.DebtDirection;
import com.preswatch.debt.DebtType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DebtResponse(
        Long id,
        String name,
        DebtDirection direction,
        DebtType type,
        BigDecimal amountPerInstallment,
        Integer installmentsTotal,
        int installmentsPaid,
        Integer remainingInstallments,
        BigDecimal totalAmount,
        Integer paymentDay,
        LocalDate dueDate,
        LocalDate startDate,
        boolean active,
        CategoryResponse category,
        CardResponse card,
        OffsetDateTime createdAt
) {}
