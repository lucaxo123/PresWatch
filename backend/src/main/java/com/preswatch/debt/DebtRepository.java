package com.preswatch.debt;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DebtRepository extends JpaRepository<Debt, Long> {

    @Query("SELECT d FROM Debt d LEFT JOIN FETCH d.category LEFT JOIN FETCH d.card " +
           "WHERE d.user.id = :userId ORDER BY d.active DESC, d.createdAt DESC")
    List<Debt> findByUserId(@Param("userId") Long userId);

    @Query("SELECT d FROM Debt d LEFT JOIN FETCH d.category LEFT JOIN FETCH d.card LEFT JOIN FETCH d.user " +
           "WHERE d.user.id = :userId AND d.active = true")
    List<Debt> findByUserIdAndActiveTrue(@Param("userId") Long userId);

    Optional<Debt> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndActiveTrue(Long userId);

    @Query("SELECT d FROM Debt d LEFT JOIN FETCH d.category LEFT JOIN FETCH d.user LEFT JOIN FETCH d.card " +
           "WHERE d.active = true " +
           "AND d.direction = :direction " +
           "AND d.type = :type " +
           "AND d.installmentsPaid < d.installmentsTotal " +
           "AND d.startDate <= :today " +
           "AND (d.paymentDay = :dayOfMonth OR (:isLastDay = true AND d.paymentDay > :lastDay))")
    List<Debt> findDueInstallmentDebts(
            @Param("direction") DebtDirection direction,
            @Param("type") DebtType type,
            @Param("dayOfMonth") int dayOfMonth,
            @Param("isLastDay") boolean isLastDay,
            @Param("lastDay") int lastDay,
            @Param("today") LocalDate today
    );

    default List<Debt> findDueInstallmentDebts(int dayOfMonth, boolean isLastDay, int lastDay, LocalDate today) {
        return findDueInstallmentDebts(DebtDirection.OWED_BY_ME, DebtType.INSTALLMENTS,
                dayOfMonth, isLastDay, lastDay, today);
    }

    @Query("SELECT d FROM Debt d LEFT JOIN FETCH d.category LEFT JOIN FETCH d.user LEFT JOIN FETCH d.card " +
           "WHERE d.active = true " +
           "AND d.direction = :direction " +
           "AND d.type = :type " +
           "AND d.dueDate = :today")
    List<Debt> findDueSingleDebts(
            @Param("direction") DebtDirection direction,
            @Param("type") DebtType type,
            @Param("today") LocalDate today
    );

    default List<Debt> findDueSingleDebts(LocalDate today) {
        return findDueSingleDebts(DebtDirection.OWED_BY_ME, DebtType.SINGLE, today);
    }
}
