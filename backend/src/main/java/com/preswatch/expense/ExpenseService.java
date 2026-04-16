package com.preswatch.expense;

import com.preswatch.category.Category;
import com.preswatch.category.CategoryRepository;
import com.preswatch.category.CategoryService;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.expense.dto.ExpenseRequest;
import com.preswatch.expense.dto.ExpenseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    public Page<ExpenseResponse> getExpenses(String month, Long categoryId, String week, int page) {
        Long userId = SecurityUtils.getCurrentUserId();

        LocalDate[] range = resolveRange(month, week);
        return expenseRepository.findFiltered(userId, categoryId, range[0], range[1], PageRequest.of(page, 20))
                .map(this::toResponse);
    }

    public ExpenseResponse create(ExpenseRequest request) {
        Expense expense = buildExpense(new Expense(), request);
        return toResponse(expenseRepository.save(expense));
    }

    public ExpenseResponse getById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));
        return toResponse(expense);
    }

    public ExpenseResponse update(Long id, ExpenseRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));
        buildExpense(expense, request);
        return toResponse(expenseRepository.save(expense));
    }

    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Expense expense = expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Gasto no encontrado"));
        expenseRepository.delete(expense);
    }

    private Expense buildExpense(Expense expense, ExpenseRequest request) {
        expense.setUser(SecurityUtils.getCurrentUser());
        expense.setAmount(request.amount());
        expense.setDescription(request.description());
        expense.setExpenseDate(request.expenseDate());

        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            expense.setCategory(category);
        } else {
            expense.setCategory(null);
        }
        return expense;
    }

    private LocalDate[] resolveRange(String month, String week) {
        if (week != null && !week.isBlank()) {
            // ISO week format: "YYYY-Www" e.g. "2025-W14"
            String[] parts = week.split("-W");
            int year = Integer.parseInt(parts[0]);
            int weekNum = Integer.parseInt(parts[1]);
            LocalDate start = LocalDate.now()
                    .withYear(year)
                    .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, weekNum)
                    .with(java.time.DayOfWeek.MONDAY);
            return new LocalDate[]{start, start.plusDays(6)};
        }

        String m = (month != null && !month.isBlank()) ? month : YearMonth.now().format(MONTH_FMT);
        YearMonth ym = YearMonth.parse(m, MONTH_FMT);
        return new LocalDate[]{ym.atDay(1), ym.atEndOfMonth()};
    }

    public ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getAmount(),
                e.getDescription(),
                e.getExpenseDate(),
                e.getCategory() != null ? categoryService.toResponse(e.getCategory()) : null,
                e.getCreatedAt()
        );
    }
}
