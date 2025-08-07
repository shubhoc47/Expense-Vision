package com.shubho.backend_service.controller;

import com.shubho.backend_service.model.Receipt;
import com.shubho.backend_service.model.User;
import com.shubho.backend_service.repository.ReceiptRepository;
import com.shubho.backend_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ExpenseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    @GetMapping("/expenses")
    public ResponseEntity<List<Receipt>> getExpensesForUser(Principal principal) {
        // Get the username of the currently logged-in user
        String username = principal.getName();

        // Find the user entity in the database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find all receipts associated with that user
        List<Receipt> receipts = receiptRepository.findByUser(user);

        // Return the list of receipts as a JSON response
        return ResponseEntity.ok(receipts);
    }
}
