package com.preswatch.card;

import com.preswatch.card.dto.CardRequest;
import com.preswatch.card.dto.CardResponse;
import com.preswatch.common.BadRequestException;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;

    public List<CardResponse> getAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        return cardRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CardResponse getById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));
        return toResponse(card);
    }

    private static final long MAX_CARDS_PER_USER = 50L;

    public CardResponse create(CardRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (cardRepository.countByUserId(userId) >= MAX_CARDS_PER_USER) {
            throw new BadRequestException("Límite de tarjetas alcanzado (máx. " + MAX_CARDS_PER_USER + ")");
        }
        if (cardRepository.existsByUserIdAndBankAndLast4(userId, request.bank(), request.last4())) {
            throw new BadRequestException("Ya existe una tarjeta de ese banco con esos últimos 4 dígitos");
        }
        Card card = Card.builder()
                .user(SecurityUtils.getCurrentUser())
                .bank(request.bank())
                .last4(request.last4())
                .color(request.color())
                .build();
        return toResponse(cardRepository.save(card));
    }

    public CardResponse update(Long id, CardRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));
        boolean changed = !card.getBank().equals(request.bank()) || !card.getLast4().equals(request.last4());
        if (changed && cardRepository.existsByUserIdAndBankAndLast4(userId, request.bank(), request.last4())) {
            throw new BadRequestException("Ya existe una tarjeta de ese banco con esos últimos 4 dígitos");
        }
        card.setBank(request.bank());
        card.setLast4(request.last4());
        card.setColor(request.color());
        return toResponse(cardRepository.save(card));
    }

    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Card card = cardRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Tarjeta no encontrada"));
        cardRepository.delete(card);
    }

    public CardResponse toResponse(Card c) {
        return new CardResponse(c.getId(), c.getBank(), c.getLast4(), c.getColor(), c.getCreatedAt());
    }
}
