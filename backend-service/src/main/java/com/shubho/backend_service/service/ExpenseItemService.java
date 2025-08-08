package com.shubho.backend_service.service;

import com.shubho.backend_service.model.ExpenseItem;
import com.shubho.backend_service.model.ExpenseItemDto;
import com.shubho.backend_service.model.Receipt;
import com.shubho.backend_service.repository.ExpenseItemRepository;
import com.shubho.backend_service.repository.ReceiptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ExpenseItemService {

    @Autowired
    private ExpenseItemRepository expenseItemRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    // CREATE
    public ExpenseItem createExpenseItem(Long receiptId, ExpenseItemDto itemDto, String username) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new RuntimeException("Receipt not found"));

        // Security Check
        if (!receipt.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not have permission to add items to this receipt");
        }

        ExpenseItem newItem = new ExpenseItem();
        newItem.setItemName(itemDto.itemName());
        newItem.setQuantity(itemDto.quantity());
        newItem.setPrice(itemDto.price());
        newItem.setReceipt(receipt);
        ExpenseItem savedItem = expenseItemRepository.save(newItem);

        // After saving the new item, update the parent receipt's totals
        updateReceiptTotals(receipt);

        return savedItem;
    }

    // UPDATE
    public ExpenseItem updateExpenseItem(Long itemId, ExpenseItemDto itemDto, String username) {
        ExpenseItem item = expenseItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Security Check
        if (!item.getReceipt().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not have permission to edit this item");
        }

        item.setItemName(itemDto.itemName());
        item.setQuantity(itemDto.quantity());
        item.setPrice(itemDto.price());
        updateReceiptTotals(item.getReceipt());

        return expenseItemRepository.save(item);
    }

    // DELETE
    @Transactional
    public void deleteExpenseItem(Long itemId, String username) {
        // Step 1: Find the item to be deleted.
        ExpenseItem item = expenseItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Step 2: Perform the security check to ensure ownership.
        if (!item.getReceipt().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not have permission to delete this item");
        }

        // Step 3: Get the parent receipt.
        Receipt receipt = item.getReceipt();

        // Step 4: Remove the child item from the parent's list.
        // Because of 'orphanRemoval = true', this will cause JPA to delete the item from the database.
        receipt.getItems().remove(item);

        updateReceiptTotals(receipt);
    }

    private void updateReceiptTotals(Receipt receipt) {
        double subtotal = receipt.getItems().stream()
                .mapToDouble(item -> item.getQuantity()*item.getPrice())
                .sum();

        double discount = receipt.getTotalDiscount() != null ? receipt.getTotalDiscount() : 0;

        receipt.setTotalAmount(subtotal-discount);
        receiptRepository.save(receipt);
    }
}