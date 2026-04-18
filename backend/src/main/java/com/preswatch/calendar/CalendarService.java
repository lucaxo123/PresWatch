package com.preswatch.calendar;

import com.preswatch.calendar.dto.CalendarDayResponse;
import com.preswatch.common.SecurityUtils;
import com.preswatch.expense.Expense;
import com.preswatch.expense.ExpenseRepository;
import com.preswatch.expense.ExpenseService;
import com.preswatch.expense.dto.ExpenseResponse;
import com.preswatch.subscription.Subscription;
import com.preswatch.subscription.SubscriptionRepository;
import com.preswatch.subscription.SubscriptionService;
import com.preswatch.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseService expenseService;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    public Map<String, CalendarDayResponse> getCalendarData(String month) {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month, MONTH_FMT);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findForStats(userId, startDate, endDate);
        Map<LocalDate, List<ExpenseResponse>> expensesByDate = expenses.stream()
                .map(expenseService::toResponse)
                .collect(Collectors.groupingBy(ExpenseResponse::expenseDate));

        List<Subscription> activeSubscriptions = subscriptionRepository.findByUserIdAndActiveTrue(userId);
        Map<LocalDate, List<SubscriptionResponse>> subscriptionsByDate = new HashMap<>();
        int lastDay = ym.lengthOfMonth();

        for (Subscription sub : activeSubscriptions) {
            if (sub.getStartDate().isAfter(endDate)) continue;
            if (sub.getEndDate() != null && sub.getEndDate().isBefore(startDate)) continue;

            int effectiveDay = Math.min(sub.getBillingDay(), lastDay);
            LocalDate billingDate = startDate.withDayOfMonth(effectiveDay);

            subscriptionsByDate
                    .computeIfAbsent(billingDate, k -> new ArrayList<>())
                    .add(subscriptionService.toResponse(sub));
        }

        Map<String, CalendarDayResponse> result = new LinkedHashMap<>();
        Set<LocalDate> allDates = new HashSet<>();
        allDates.addAll(expensesByDate.keySet());
        allDates.addAll(subscriptionsByDate.keySet());

        for (LocalDate date : allDates) {
            result.put(date.toString(), new CalendarDayResponse(
                    date,
                    expensesByDate.getOrDefault(date, List.of()),
                    subscriptionsByDate.getOrDefault(date, List.of())
            ));
        }

        return result;
    }
}
