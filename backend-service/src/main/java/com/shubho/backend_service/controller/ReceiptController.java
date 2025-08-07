package com.shubho.backend_service.controller;

import com.shubho.backend_service.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal; // Import this

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    // Modify the method to accept the Principal object
    @PostMapping("/upload")
    public ResponseEntity<?> uploadReceipt(@RequestParam("image") MultipartFile file, Principal principal) {
        try {
            // Get the username from the principal and pass it to the service
            receiptService.processAndSaveReceipt(file, principal.getName());
            return ResponseEntity.ok("Receipt processed successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing receipt: " + e.getMessage());
        }
    }
}