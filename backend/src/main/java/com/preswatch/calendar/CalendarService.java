package com.preswatch.calendar;

import com.preswatch.calendar.dto.CalendarDayResponse;
import com.preswatch.common.SecurityUtils;
import com.preswatch.debt.Debt;
import com.preswatch.debt.DebtRepository;
import com.preswatch.debt.DebtService;
import com.preswatch.debt.DebtType;
import com.preswatch.debt.dto.DebtResponse;
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
    private final DebtRepository debtRepository;
    private final DebtService debtService;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    public Map<String, CalendarDayResponse> getCalendarData(String month) {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month, MONTH_FMT);
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();
        int lastDay = ym.lengthOfMonth();

        List<Expense> expenses = expenseRepository.findForStats(userId, startDate, endDate);
        Map<LocalDate, List<ExpenseResponse>> expensesByDate = expenses.stream()
                .map(expenseService::toResponse)
                .collect(Collectors.groupingBy(ExpenseResponse::expenseDate));

        List<Subscription> activeSubscriptions = subscriptionRepository.findByUserIdAndActiveTrue(userId);
        Map<LocalDate, List<SubscriptionResponse>> subscriptionsByDate = new HashMap<>();
        for (Subscription sub : activeSubscriptions) {
            if (sub.getStartDate().isAfter(endDate)) continue;
            if (sub.getEndDate() != null && sub.getEndDate().isBefore(startDate)) continue;

            int effectiveDay = Math.min(sub.getBillingDay(), lastDay);
            LocalDate billingDate = startDate.withDayOfMonth(effectiveDay);
            subscriptionsByDate.computeIfAbsent(billingDate, k -> new ArrayList<>())
                    .add(subscriptionService.toResponse(sub));
        }

        List<Debt> activeDebts = debtRepository.findByUserIdAndActiveTrue(userId);
        Map<LocalDate, List<DebtResponse>> debtsByDate = new HashMap<>();
        for (Debt debt : activeDebts) {
            LocalDate paymentDate = computeDebtDateInMonth(debt, ym, startDate, endDate, lastDay);
            if (paymentDate == null) continue;
            debtsByDate.computeIfAbsent(paymentDate, k -> new ArrayList<>())
                    .add(debtService.toResponse(debt));
        }

        Map<String, CalendarDayResponse> result = new LinkedHashMap<>();
        Set<LocalDate> allDates = new HashSet<>();
        allDates.addAll(expensesByDate.keySet());
        allDates.addAll(subscriptionsByDate.keySet());
        allDates.addAll(debtsByDate.keySet());

        for (LocalDate date : allDates) {
            result.put(date.toString(), new CalendarDayResponse(
                    date,
                    expensesByDate.getOrDefault(date, List.of()),
                    subscriptionsByDate.getOrDefault(date, List.of()),
                    debtsByDate.getOrDefault(date, List.of())
            ));
        }

        return result;
    }

    private LocalDate computeDebtDateInMonth(Debt debt, YearMonth ym, LocalDate startDate, LocalDate endDate, int lastDay) {
        if (debt.getType() == DebtType.SINGLE) {
            LocalDate due = debt.getDueDate();
            if (due == null || due.isBefore(startDate) || due.isAfter(endDate)) return null;
            return due;
        }
        if (debt.getInstallmentsTotal() != null && debt.getInstallmentsPaid() >= debt.getInstallmentsTotal()) {
            return null;
        }
        if (debt.getStartDate().isAfter(endDate)) return null;
        if (debt.getPaymentDay() == null) return null;
        int effectiveDay = Math.min(debt.getPaymentDay(), lastDay);
        LocalDate paymentDate = ym.atDay(effectiveDay);
        if (paymentDate.isBefore(debt.getStartDate())) return null;
        return paymentDate;
    }
}
