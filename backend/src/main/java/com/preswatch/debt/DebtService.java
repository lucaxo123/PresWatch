package com.preswatch.debt;

import com.preswatch.card.Card;
import com.preswatch.card.CardRepository;
import com.preswatch.card.CardService;
import com.preswatch.category.Category;
import com.preswatch.category.CategoryRepository;
import com.preswatch.category.CategoryService;
import com.preswatch.common.BadRequestException;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.debt.dto.DebtRequest;
import com.preswatch.debt.dto.DebtResponse;
import com.preswatch.expense.Expense;
import com.preswatch.expense.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debtRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final CardRepository cardRepository;
    private final CardService cardService;
    private final ExpenseRepository expenseRepository;

    public List<DebtResponse> getAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        return debtRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public DebtResponse getById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));
        return toResponse(debt);
    }

    private static final long MAX_ACTIVE_DEBTS_PER_USER = 200L;

    @Transactional
    public DebtResponse create(DebtRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (debtRepository.countByUserIdAndActiveTrue(userId) >= MAX_ACTIVE_DEBTS_PER_USER) {
            throw new BadRequestException("Límite de deudas activas alcanzado (máx. " + MAX_ACTIVE_DEBTS_PER_USER + ")");
        }
        Debt debt = buildDebt(new Debt(), request);
        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public DebtResponse update(Long id, DebtRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));
        buildDebt(debt, request);
        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));
        debtRepository.delete(debt);
    }

    @Transactional
    public DebtResponse toggleActive(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));
        debt.setActive(!debt.isActive());
        return toResponse(debtRepository.save(debt));
    }

    @Transactional
    public DebtResponse markInstallmentReceived(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Debt debt = debtRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Deuda no encontrada"));
        if (debt.getDirection() != DebtDirection.OWED_TO_ME) {
            throw new BadRequestException("Sólo se pueden marcar como cobradas deudas a favor (OWED_TO_ME)");
        }
        if (debt.getType() == DebtType.INSTALLMENTS) {
            if (debt.getInstallmentsPaid() >= debt.getInstallmentsTotal()) {
                throw new BadRequestException("Todas las cuotas ya fueron cobradas");
            }
            debt.setInstallmentsPaid(debt.getInstallmentsPaid() + 1);
            if (debt.getInstallmentsPaid() >= debt.getInstallmentsTotal()) {
                debt.setActive(false);
            }
        } else {
            if (!debt.isActive()) {
                throw new BadRequestException("La deuda ya fue cobrada");
            }
            debt.setInstallmentsPaid(1);
            debt.setActive(false);
        }
        return toResponse(debtRepository.save(debt));
    }

    public BigDecimal getTotalMonthlyOwedByMe() {
        Long userId = SecurityUtils.getCurrentUserId();
        YearMonth ym = YearMonth.now();
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        return debtRepository.findByUserIdAndActiveTrue(userId).stream()
                .filter(d -> d.getDirection() == DebtDirection.OWED_BY_ME)
                .filter(d -> hasPaymentInMonth(d, start, end))
                .map(Debt::getAmountPerInstallment)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean hasPaymentInMonth(Debt d, LocalDate start, LocalDate end) {
        if (d.getType() == DebtType.SINGLE) {
            return d.getDueDate() != null && !d.getDueDate().isBefore(start) && !d.getDueDate().isAfter(end);
        }
        if (d.getInstallmentsTotal() != null && d.getInstallmentsPaid() >= d.getInstallmentsTotal()) {
            return false;
        }
        return !d.getStartDate().isAfter(end);
    }

    private Debt buildDebt(Debt debt, DebtRequest request) {
        boolean isCreate = debt.getId() == null;
        validateRequest(request, isCreate);
        Long userId = SecurityUtils.getCurrentUserId();
        if (isCreate) {
            debt.setUser(SecurityUtils.getCurrentUser());
        }
        debt.setName(request.name());
        debt.setDirection(request.direction());
        debt.setType(request.type());
        debt.setAmountPerInstallment(request.amountPerInstallment());
        debt.setStartDate(request.startDate());

        if (request.type() == DebtType.INSTALLMENTS) {
            debt.setInstallmentsTotal(request.installmentsTotal());
            if (isCreate) {
                debt.setInstallmentsPaid(request.installmentsPaid() != null ? request.installmentsPaid() : 0);
            }
            debt.setPaymentDay(request.paymentDay());
            debt.setDueDate(null);
        } else {
            debt.setInstallmentsTotal(null);
            if (isCreate) {
                debt.setInstallmentsPaid(0);
            }
            debt.setPaymentDay(null);
            debt.setDueDate(request.dueDate());
        }

        if (request.categoryId() != null) {
            Category category = categoryRepository.findByIdVisibleToUser(request.categoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            debt.setCategory(category);
        } else {
            debt.setCategory(null);
        }

        if (request.cardId() != null) {
            Card card = cardRepository.findByIdAndUserId(request.cardId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));
            debt.setCard(card);
        } else {
            debt.setCard(null);
        }

        if (debt.getInstallmentsTotal() != null && debt.getInstallmentsPaid() >= debt.getInstallmentsTotal()) {
            debt.setActive(false);
        }
        return debt;
    }

    @Transactional
    public void processInstallmentPayment(Long debtId, LocalDate today) {
        Debt debt = debtRepository.findById(debtId).orElse(null);
        if (debt == null || !debt.isActive()) return;
        if (debt.getInstallmentsTotal() == null || debt.getInstallmentsPaid() >= debt.getInstallmentsTotal()) return;

        int next = debt.getInstallmentsPaid() + 1;
        String description = String.format("%s (cuota %d/%d)", debt.getName(), next, debt.getInstallmentsTotal());
        try {
            Expense expense = Expense.builder()
                    .user(debt.getUser())
                    .category(debt.getCategory())
                    .amount(debt.getAmountPerInstallment())
                    .description(description)
                    .expenseDate(today)
                    .debt(debt)
                    .build();
            expenseRepository.saveAndFlush(expense);
        } catch (DataIntegrityViolationException e) {
            return;
        }
        debt.setInstallmentsPaid(next);
        if (next >= debt.getInstallmentsTotal()) {
            debt.setActive(false);
        }
        debtRepository.save(debt);
    }

    @Transactional
    public void processSinglePayment(Long debtId, LocalDate today) {
        Debt debt = debtRepository.findById(debtId).orElse(null);
        if (debt == null || !debt.isActive()) return;

        try {
            Expense expense = Expense.builder()
                    .user(debt.getUser())
                    .category(debt.getCategory())
                    .amount(debt.getAmountPerInstallment())
                    .description(debt.getName())
                    .expenseDate(today)
                    .debt(debt)
                    .build();
            expenseRepository.saveAndFlush(expense);
        } catch (DataIntegrityViolationException e) {
            return;
        }
        debt.setInstallmentsPaid(1);
        debt.setActive(false);
        debtRepository.save(debt);
    }

    private void validateRequest(DebtRequest request, boolean isCreate) {
        if (request.type() == DebtType.INSTALLMENTS) {
            if (request.installmentsTotal() == null || request.installmentsTotal() < 1) {
                throw new BadRequestException("installmentsTotal es obligatorio para deudas en cuotas");
            }
            if (request.paymentDay() == null) {
                throw new BadRequestException("paymentDay es obligatorio para deudas en cuotas");
            }
            if (isCreate && request.installmentsPaid() != null
                    && request.installmentsPaid() > request.installmentsTotal()) {
                throw new BadRequestException("installmentsPaid no puede ser mayor que installmentsTotal");
            }
        } else {
            if (request.dueDate() == null) {
                throw new BadRequestException("dueDate es obligatorio para deudas de pago único");
            }
        }
    }

    public DebtResponse toResponse(Debt d) {
        Integer remaining = d.getInstallmentsTotal() != null
                ? d.getInstallmentsTotal() - d.getInstallmentsPaid()
                : null;
        BigDecimal totalAmount = d.getInstallmentsTotal() != null
                ? d.getAmountPerInstallment().multiply(BigDecimal.valueOf(d.getInstallmentsTotal()))
                : d.getAmountPerInstallment();
        return new DebtResponse(
                d.getId(),
                d.getName(),
                d.getDirection(),
                d.getType(),
                d.getAmountPerInstallment(),
                d.getInstallmentsTotal(),
                d.getInstallmentsPaid(),
                remaining,
                totalAmount,
                d.getPaymentDay(),
                d.getDueDate(),
                d.getStartDate(),
                d.isActive(),
                d.getCategory() != null ? categoryService.toResponse(d.getCategory()) : null,
                d.getCard() != null ? cardService.toResponse(d.getCard()) : null,
                d.getCreatedAt()
        );
    }
}
