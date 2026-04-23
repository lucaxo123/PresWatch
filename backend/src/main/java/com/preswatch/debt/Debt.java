package com.preswatch.debt;

import com.preswatch.card.Card;
import com.preswatch.category.Category;
import com.preswatch.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "debts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id")
    private Card card;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DebtDirection direction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DebtType type;

    @Column(name = "amount_per_installment", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPerInstallment;

    @Column(name = "installments_total")
    private Integer installmentsTotal;

    @Column(name = "installments_paid", nullable = false)
    @Builder.Default
    private int installmentsPaid = 0;

    @Column(name = "payment_day")
    private Integer paymentDay;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
