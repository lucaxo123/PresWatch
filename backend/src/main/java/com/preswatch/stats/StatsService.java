package com.preswatch.stats;

import com.preswatch.budget.BudgetRepository;
import com.preswatch.common.SecurityUtils;
import com.preswatch.expense.Expense;
import com.preswatch.expense.ExpenseRepository;
import com.preswatch.stats.dto.CategoryBreakdownItem;
import com.preswatch.stats.dto.MonthlyStatsResponse;
import com.preswatch.stats.dto.WeeklyBreakdown;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final ExpenseRepository expenseRepository;
    private final BudgetRepository budgetRepository;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    public MonthlyStatsResponse getMonthlyStats(String month) {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month, MONTH_FMT);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findForStats(userId, start, end);

        BigDecimal totalSpent = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal budget = budgetRepository.findByUserIdAndMonth(userId, start)
                .map(b -> b.getAmount())
                .orElse(BigDecimal.ZERO);

        BigDecimal remaining = budget.subtract(totalSpent);
        double percentUsed = budget.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(budget, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        List<CategoryBreakdownItem> breakdown = buildBreakdown(expenses, totalSpent);

        return new MonthlyStatsResponse(month, budget, totalSpent, remaining, percentUsed, breakdown);
    }

    public List<WeeklyBreakdown> getWeeklyBreakdown(String month) {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.parse(month, MONTH_FMT);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Expense> expenses = expenseRepository.findForStats(userId, start, end);

        Map<Integer, BigDecimal> weekTotals = new TreeMap<>();
        Map<Integer, LocalDate[]> weekRanges = new TreeMap<>();

        for (Expense e : expenses) {
            int week = e.getExpenseDate().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            weekTotals.merge(week, e.getAmount(), BigDecimal::add);
            weekRanges.computeIfAbsent(week, w -> {
                LocalDate monday = e.getExpenseDate().with(DayOfWeek.MONDAY);
                LocalDate sunday = monday.plusDays(6);
                return new LocalDate[]{monday, sunday};
            });
        }

        int year = ym.getYear();
        return weekTotals.entrySet().stream()
                .map(entry -> {
                    int w = entry.getKey();
                    LocalDate[] range = weekRanges.get(w);
                    String weekLabel = year + "-W" + String.format("%02d", w);
                    return new WeeklyBreakdown(weekLabel, range[0], range[1], entry.getValue());
                })
                .toList();
    }

    private List<CategoryBreakdownItem> buildBreakdown(List<Expense> expenses, BigDecimal totalSpent) {
        Map<Long, BigDecimal> categoryTotals = new LinkedHashMap<>();
        Map<Long, String> categoryNames = new HashMap<>();
        Map<Long, String> categoryColors = new HashMap<>();
        Map<Long, String> categoryIcons = new HashMap<>();

        for (Expense e : expenses) {
            Long catId = e.getCategory() != null ? e.getCategory().getId() : 0L;
            String catName = e.getCategory() != null ? e.getCategory().getName() : "Uncategorized";
            String catColor = e.getCategory() != null ? e.getCategory().getColor() : "#a8a29e";
            String catIcon = e.getCategory() != null ? e.getCategory().getIcon() : "📦";

            categoryTotals.merge(catId, e.getAmount(), BigDecimal::add);
            categoryNames.put(catId, catName);
            categoryColors.put(catId, catColor);
            categoryIcons.put(catId, catIcon);
        }

        return categoryTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .map(entry -> {
                    Long catId = entry.getKey();
                    BigDecimal amount = entry.getValue();
                    double percent = totalSpent.compareTo(BigDecimal.ZERO) > 0
                            ? amount.divide(totalSpent, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                            : 0.0;
                    return new CategoryBreakdownItem(
                            catId == 0L ? null : catId,
                            categoryNames.get(catId),
                            categoryColors.get(catId),
                            categoryIcons.get(catId),
                            amount,
                            percent
                    );
                })
                .toList();
    }
}
