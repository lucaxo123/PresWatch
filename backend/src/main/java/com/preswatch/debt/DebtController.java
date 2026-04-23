package com.preswatch.debt;

import com.preswatch.debt.dto.DebtRequest;
import com.preswatch.debt.dto.DebtResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
public class DebtController {

    private final DebtService debtService;

    @GetMapping
    public ResponseEntity<List<DebtResponse>> getAll() {
        return ResponseEntity.ok(debtService.getAll());
    }

    @PostMapping
    public ResponseEntity<DebtResponse> create(@Valid @RequestBody DebtRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(debtService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DebtResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(debtService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DebtResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody DebtRequest request) {
        return ResponseEntity.ok(debtService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        debtService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<DebtResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(debtService.toggleActive(id));
    }

    @PatchMapping("/{id}/mark-received")
    public ResponseEntity<DebtResponse> markReceived(@PathVariable Long id) {
        return ResponseEntity.ok(debtService.markInstallmentReceived(id));
    }

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalMonthlyOwed() {
        return ResponseEntity.ok(debtService.getTotalMonthlyOwedByMe());
    }
}
