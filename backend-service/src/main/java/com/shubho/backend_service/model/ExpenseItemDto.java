package com.shubho.backend_service.model;

// This record is a simple data carrier for creating and updating items.
public record ExpenseItemDto(String itemName, Integer quantity, Double price) {
}