package com.preswatch.subscription;

import com.preswatch.category.Category;
import com.preswatch.category.CategoryRepository;
import com.preswatch.category.CategoryService;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.subscription.dto.SubscriptionRequest;
import com.preswatch.subscription.dto.SubscriptionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    public List<SubscriptionResponse> getAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        return subscriptionRepository.findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SubscriptionResponse create(SubscriptionRequest request) {
        Subscription subscription = buildSubscription(new Subscription(), request);
        return toResponse(subscriptionRepository.save(subscription));
    }

    public SubscriptionResponse getById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Subscription subscription = subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción no encontrada"));
        return toResponse(subscription);
    }

    public SubscriptionResponse update(Long id, SubscriptionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Subscription subscription = subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción no encontrada"));
        buildSubscription(subscription, request);
        return toResponse(subscriptionRepository.save(subscription));
    }

    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Subscription subscription = subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción no encontrada"));
        subscriptionRepository.delete(subscription);
    }

    public SubscriptionResponse toggleActive(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Subscription subscription = subscriptionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Suscripción no encontrada"));
        subscription.setActive(!subscription.isActive());
        return toResponse(subscriptionRepository.save(subscription));
    }

    public BigDecimal getTotalMonthlySubscriptionCost() {
        Long userId = SecurityUtils.getCurrentUserId();
        return subscriptionRepository.findByUserIdAndActiveTrue(userId)
                .stream()
                .map(Subscription::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Subscription buildSubscription(Subscription subscription, SubscriptionRequest request) {
        subscription.setUser(SecurityUtils.getCurrentUser());
        subscription.setName(request.name());
        subscription.setAmount(request.amount());
        subscription.setBillingDay(request.billingDay());
        subscription.setStartDate(request.startDate());
        subscription.setEndDate(request.endDate());

        if (request.categoryId() != null) {
            Long userId = SecurityUtils.getCurrentUserId();
            Category category = categoryRepository.findByIdVisibleToUser(request.categoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            subscription.setCategory(category);
        } else {
            subscription.setCategory(null);
        }
        return subscription;
    }

    public SubscriptionResponse toResponse(Subscription s) {
        return new SubscriptionResponse(
                s.getId(),
                s.getName(),
                s.getAmount(),
                s.getBillingDay(),
                s.isActive(),
                s.getStartDate(),
                s.getEndDate(),
                s.getCategory() != null ? categoryService.toResponse(s.getCategory()) : null,
                s.getCreatedAt()
        );
    }
}
