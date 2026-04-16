package com.preswatch.category.dto;

public record CategoryResponse(
        Long id,
        String name,
        String color,
        String icon,
        boolean isDefault
) {}
