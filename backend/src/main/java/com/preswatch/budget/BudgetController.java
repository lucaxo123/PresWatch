package com.preswatch.budget;

import com.preswatch.budget.dto.BudgetRequest;
import com.preswatch.budget.dto.BudgetResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    @GetMapping
    public ResponseEntity<BudgetResponse> get(
            @RequestParam(defaultValue = "") String month) {
        if (month.isBlank()) {
            month = YearMonth.now().format(MONTH_FMT);
        }
        return ResponseEntity.ok(budgetService.getBudget(month));
    }

    @PutMapping
    public ResponseEntity<BudgetResponse> upsert(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.upsert(request));
    }
}
