package com.preswatch.stats.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record WeeklyBreakdown(
        String week,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal total
) {}
