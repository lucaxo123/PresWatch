package com.preswatch.category;

import com.preswatch.category.dto.CategoryRequest;
import com.preswatch.category.dto.CategoryResponse;
import com.preswatch.common.AccessDeniedException;
import com.preswatch.common.BadRequestException;
import com.preswatch.common.ResourceNotFoundException;
import com.preswatch.common.SecurityUtils;
import com.preswatch.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAll() {
        Long userId = SecurityUtils.getCurrentUserId();
        return categoryRepository.findAllVisibleToUser(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse create(CategoryRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (categoryRepository.existsByNameAndUserId(request.name(), userId)) {
            throw new BadRequestException("Ya existe una categoría con ese nombre");
        }
        User user = SecurityUtils.getCurrentUser();
        Category category = Category.builder()
                .user(user)
                .name(request.name())
                .color(request.color())
                .icon(request.icon())
                .isDefault(false)
                .build();
        return toResponse(categoryRepository.save(category));
    }

    public CategoryResponse update(Long id, CategoryRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        if (category.isDefault()) {
            throw new AccessDeniedException("No se pueden modificar las categorías predeterminadas");
        }
        category.setName(request.name());
        category.setColor(request.color());
        category.setIcon(request.icon());
        return toResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
        if (category.isDefault()) {
            throw new AccessDeniedException("No se pueden eliminar las categorías predeterminadas");
        }
        categoryRepository.delete(category);
    }

    public CategoryResponse toResponse(Category c) {
        return new CategoryResponse(c.getId(), c.getName(), c.getColor(), c.getIcon(), c.isDefault());
    }
}
