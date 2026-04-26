package com.preswatch.debt.dto;

import com.preswatch.debt.DebtDirection;
import com.preswatch.debt.DebtType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DebtRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull DebtDirection direction,
        @NotNull DebtType type,
        @NotNull
        @Positive
        @Digits(integer = 9, fraction = 2, message = "Máximo 9 dígitos enteros y 2 decimales")
        BigDecimal amountPerInstallment,
        @Min(1) @Max(1200) Integer installmentsTotal,
        @Min(0) @Max(1200) Integer installmentsPaid,
        @Min(1) @Max(31) Integer paymentDay,
        LocalDate dueDate,
        @NotNull @PastOrPresent(message = "La fecha de inicio no puede ser futura") LocalDate startDate,
        Long categoryId,
        Long cardId
) {}
