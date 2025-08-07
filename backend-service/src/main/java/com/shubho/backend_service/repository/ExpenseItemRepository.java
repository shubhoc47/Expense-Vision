package com.shubho.backend_service.repository;

import com.shubho.backend_service.model.ExpenseItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseItemRepository extends JpaRepository<ExpenseItem, Long> {
}