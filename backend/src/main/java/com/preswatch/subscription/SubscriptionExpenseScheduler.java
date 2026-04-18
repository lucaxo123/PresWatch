package com.preswatch.subscription;

import com.preswatch.expense.Expense;
import com.preswatch.expense.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionExpenseScheduler {

    private final SubscriptionRepository subscriptionRepository;
    private final ExpenseRepository expenseRepository;

    @Scheduled(cron = "0 5 0 * * *")
    public void createSubscriptionExpenses() {
        LocalDate today = LocalDate.now();
        int dayOfMonth = today.getDayOfMonth();
        int lastDay = today.lengthOfMonth();
        boolean isLastDay = dayOfMonth == lastDay;

        List<Subscription> dueSubscriptions = subscriptionRepository
                .findDueSubscriptions(dayOfMonth, isLastDay, lastDay, today);

        for (Subscription sub : dueSubscriptions) {
            try {
                Expense expense = Expense.builder()
                        .user(sub.getUser())
                        .category(sub.getCategory())
                        .amount(sub.getAmount())
                        .description(sub.getName())
                        .expenseDate(today)
                        .subscription(sub)
                        .build();
                expenseRepository.save(expense);
                log.info("Created expense for subscription: id={}, name={}", sub.getId(), sub.getName());
            } catch (DataIntegrityViolationException e) {
                log.debug("Subscription expense already exists: sub={}, date={}", sub.getId(), today);
            } catch (Exception e) {
                log.error("Failed to create expense for subscription: id={}, name={}", sub.getId(), sub.getName(), e);
            }
        }
    }
}
