package com.preswatch.stats.dto;

import java.math.BigDecimal;

public record CategoryBreakdownItem(
        Long categoryId,
        String categoryName,
        String color,
        String icon,
        BigDecimal amount,
        double percent
) {}
