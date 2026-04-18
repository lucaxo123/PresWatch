package com.preswatch.calendar.dto;

import com.preswatch.expense.dto.ExpenseResponse;
import com.preswatch.subscription.dto.SubscriptionResponse;

import java.time.LocalDate;
import java.util.List;

public record CalendarDayResponse(
        LocalDate date,
        List<ExpenseResponse> expenses,
        List<SubscriptionResponse> subscriptions
) {}
