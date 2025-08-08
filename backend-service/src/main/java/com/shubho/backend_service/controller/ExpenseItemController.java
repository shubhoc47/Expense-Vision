package com.shubho.backend_service.controller;

import com.shubho.backend_service.model.ExpenseItem;
import com.shubho.backend_service.model.ExpenseItemDto;
import com.shubho.backend_service.service.ExpenseItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/items")
public class ExpenseItemController {

    @Autowired
    private ExpenseItemService expenseItemService;

    @PostMapping("/receipt/{receiptId}")
    public ResponseEntity<?> createExpenseItem(@PathVariable Long receiptId, @RequestBody ExpenseItemDto itemDto, Principal principal) {
        try {
            ExpenseItem newItem = expenseItemService.createExpenseItem(receiptId, itemDto, principal.getName());
            return ResponseEntity.ok(newItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<?> updateExpenseItem(@PathVariable Long itemId, @RequestBody ExpenseItemDto itemDto, Principal principal) {
        try {
            ExpenseItem updatedItem = expenseItemService.updateExpenseItem(itemId, itemDto, principal.getName());
            return ResponseEntity.ok(updatedItem);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<?> deleteExpenseItem(@PathVariable Long itemId, Principal principal) {

        try {
            System.out.println(itemId);
            expenseItemService.deleteExpenseItem(itemId, principal.getName());
            return ResponseEntity.ok("Item deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}