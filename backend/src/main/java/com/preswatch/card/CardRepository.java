package com.preswatch.card;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Card> findByIdAndUserId(Long id, Long userId);

    boolean existsByUserIdAndBankAndLast4(Long userId, String bank, String last4);

    long countByUserId(Long userId);
}
