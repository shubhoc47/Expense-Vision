package com.shubho.backend_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shubho.backend_service.model.ExpenseItem; // Import ExpenseItem
import com.shubho.backend_service.model.User;
import com.shubho.backend_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.shubho.backend_service.model.Receipt; // Import Receipt
import com.shubho.backend_service.repository.ReceiptRepository; // Import ReceiptRepository
import java.time.LocalDate;
import java.util.ArrayList; // Import ArrayList
import java.util.List; // Import List

@Service
public class ReceiptService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private UserRepository userRepository;

    public void processAndSaveReceipt(MultipartFile imageFile, String username) throws Exception {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", imageFile.getResource());
        String pythonServiceUrl = "http://localhost:5000/process-receipt";
        String jsonResponse = restTemplate.postForObject(pythonServiceUrl, body, String.class);

        // --- THIS IS THE NEW LOGIC ---

        // 1. Use ObjectMapper to parse the JSON string into a tree of nodes
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(jsonResponse);

        // 2. Create the main Receipt object and populate it from the JSON
        Receipt receipt = new Receipt();
        receipt.setUser(user);
        receipt.setStoreName(rootNode.path("store_name").asText("Unknown Store"));
        receipt.setReceiptDate(LocalDate.now()); // Or parse from receipt if available

        // Get the date string from the AI's response
        String dateStr = rootNode.path("receipt_date").asText(LocalDate.now().toString());
        try {
            // Parse the string and set it as the receipt date
            receipt.setReceiptDate(LocalDate.parse(dateStr));
        } catch (Exception e) {
            // If parsing fails for any reason, fall back to the current date
            receipt.setReceiptDate(LocalDate.now());
        }


        // Safely parse the total price
        String totalPriceStr = rootNode.path("total_price").asText("0.0");
        try {
            receipt.setTotalAmount(Double.parseDouble(totalPriceStr.replaceAll("[^\\d.]", "")));
        } catch (NumberFormatException e) {
            receipt.setTotalAmount(0.0);
        }

        // Safely parse the total discount from the JSON
        String totalDiscountStr = rootNode.path("total_discount").asText("0.0");
        try {
            receipt.setTotalDiscount(Double.parseDouble(totalDiscountStr.replaceAll("[^\\d.]", "")));
        } catch (NumberFormatException e) {
            receipt.setTotalDiscount(0.0);
        }

        // 3. Create a list to hold the expense items
        List<ExpenseItem> items = new ArrayList<>();
        JsonNode itemsNode = rootNode.path("items");
        if (itemsNode.isArray()) {
            for (JsonNode itemNode : itemsNode) {
                ExpenseItem item = new ExpenseItem();
                item.setItemName(itemNode.path("name").asText());

                // Set the quantity from the JSON
                item.setQuantity(itemNode.path("quantity").asInt(1)); // <-- ADD THIS LINE (defaults to 1 if not found)

                // Safely parse the item price
                String itemPriceStr = itemNode.path("price").asText("0.0");
                try {
                    item.setPrice(Double.parseDouble(itemPriceStr.replaceAll("[^\\d.]", "")));
                } catch (NumberFormatException e) {
                    item.setPrice(0.0);
                }

                item.setReceipt(receipt);
                items.add(item);
            }
        }

        // 4. Set the list of items on the receipt
        receipt.setItems(items);

        // 5. Save the receipt. Because of CascadeType.ALL, this also saves all the items.
        receiptRepository.save(receipt);
    }
}