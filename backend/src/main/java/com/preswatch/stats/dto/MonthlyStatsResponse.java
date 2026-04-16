package com.preswatch.stats.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyStatsResponse(
        String month,
        BigDecimal budget,
        BigDecimal totalSpent,
        BigDecimal remaining,
        double percentUsed,
        List<CategoryBreakdownItem> categoryBreakdown
) {}
