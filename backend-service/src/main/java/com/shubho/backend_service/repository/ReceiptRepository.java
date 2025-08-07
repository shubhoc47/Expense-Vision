package com.shubho.backend_service.repository;

import com.shubho.backend_service.model.Receipt;
import com.shubho.backend_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    List<Receipt> findByUser(User user);
}