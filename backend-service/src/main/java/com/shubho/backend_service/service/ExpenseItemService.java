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

        return expenseItemRepository.save(newItem);
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

        return expenseItemRepository.save(item);
    }

    // DELETE
    public void deleteExpenseItem(Long itemId, String username) {
        ExpenseItem item = expenseItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Security Check
        if (!item.getReceipt().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not have permission to delete this item");
        }

        expenseItemRepository.delete(item);
    }
}