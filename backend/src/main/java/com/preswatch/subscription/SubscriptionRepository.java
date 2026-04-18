package com.preswatch.subscription;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    @Query("SELECT s FROM Subscription s LEFT JOIN FETCH s.category WHERE s.user.id = :userId")
    List<Subscription> findByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Subscription s LEFT JOIN FETCH s.category " +
           "WHERE s.user.id = :userId AND s.active = true")
    List<Subscription> findByUserIdAndActiveTrue(@Param("userId") Long userId);

    Optional<Subscription> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT s FROM Subscription s LEFT JOIN FETCH s.category LEFT JOIN FETCH s.user " +
           "WHERE s.active = true " +
           "AND s.startDate <= :today " +
           "AND (s.endDate IS NULL OR s.endDate >= :today) " +
           "AND (s.billingDay = :dayOfMonth " +
           "     OR (:isLastDay = true AND s.billingDay > :lastDay))")
    List<Subscription> findDueSubscriptions(
            @Param("dayOfMonth") int dayOfMonth,
            @Param("isLastDay") boolean isLastDay,
            @Param("lastDay") int lastDay,
            @Param("today") LocalDate today
    );
}
