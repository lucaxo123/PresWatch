package com.preswatch.card.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CardRequest(
        @NotBlank @Size(max = 100) String bank,
        @NotBlank @Pattern(regexp = "^[0-9]{4}$", message = "last4 debe tener exactamente 4 dígitos") String last4,
        @NotBlank @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "color debe ser un hex como #AABBCC") String color
) {}
