package com.preswatch.debt;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Component
@Slf4j
public class DebtExpenseScheduler {

    private final DebtRepository debtRepository;
    private final DebtService debtService;
    private final ZoneId zone;

    public DebtExpenseScheduler(DebtRepository debtRepository,
                                DebtService debtService,
                                @Value("${app.scheduler.timezone:UTC}") String timezone) {
        this.debtRepository = debtRepository;
        this.debtService = debtService;
        this.zone = ZoneId.of(timezone);
    }

    @Scheduled(cron = "0 10 0 * * *", zone = "${app.scheduler.timezone:UTC}")
    public void createDebtExpenses() {
        LocalDate today = LocalDate.now(zone);
        int dayOfMonth = today.getDayOfMonth();
        int lastDay = today.lengthOfMonth();
        boolean isLastDay = dayOfMonth == lastDay;

        List<Debt> dueInstallments = debtRepository.findDueInstallmentDebts(dayOfMonth, isLastDay, lastDay, today);
        for (Debt debt : dueInstallments) {
            try {
                debtService.processInstallmentPayment(debt.getId(), today);
            } catch (Exception e) {
                log.error("Failed to process installment debt: id={}", debt.getId(), e);
            }
        }

        List<Debt> dueSingles = debtRepository.findDueSingleDebts(today);
        for (Debt debt : dueSingles) {
            try {
                debtService.processSinglePayment(debt.getId(), today);
            } catch (Exception e) {
                log.error("Failed to process single debt: id={}", debt.getId(), e);
            }
        }
    }
}
