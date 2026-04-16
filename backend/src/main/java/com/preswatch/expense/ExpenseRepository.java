package com.preswatch.expense;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e LEFT JOIN FETCH e.category " +
           "WHERE e.user.id = :userId " +
           "AND (:categoryId IS NULL OR e.category.id = :categoryId) " +
           "AND e.expenseDate BETWEEN :startDate AND :endDate " +
           "ORDER BY e.expenseDate DESC, e.createdAt DESC")
    Page<Expense> findFiltered(
            @Param("userId") Long userId,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @Query("SELECT e FROM Expense e LEFT JOIN FETCH e.category " +
           "WHERE e.user.id = :userId " +
           "AND e.expenseDate BETWEEN :startDate AND :endDate")
    List<Expense> findForStats(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    Optional<Expense> findByIdAndUserId(Long id, Long userId);
}
