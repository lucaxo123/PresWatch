package com.preswatch.budget;

import com.preswatch.budget.dto.BudgetRequest;
import com.preswatch.budget.dto.BudgetResponse;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    public BudgetResponse getBudget(String month) {
        Long userId = SecurityUtils.getCurrentUserId();
        LocalDate monthDate = parseMonth(month);
        return budgetRepository.findByUserIdAndMonth(userId, monthDate)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("No hay presupuesto configurado para " + month));
    }

    public BudgetResponse upsert(BudgetRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = SecurityUtils.getCurrentUser();
        LocalDate monthDate = parseMonth(request.month());

        Budget budget = budgetRepository.findByUserIdAndMonth(userId, monthDate)
                .orElse(Budget.builder().user(user).month(monthDate).build());

        budget.setAmount(request.amount());
        return toResponse(budgetRepository.save(budget));
    }

    private LocalDate parseMonth(String month) {
        YearMonth ym = YearMonth.parse(month, MONTH_FMT);
        return ym.atDay(1);
    }

    private BudgetResponse toResponse(Budget b) {
        String month = YearMonth.from(b.getMonth()).format(MONTH_FMT);
        return new BudgetResponse(b.getId(), b.getAmount(), month);
    }
}
