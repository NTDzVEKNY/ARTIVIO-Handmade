package com.artivio.backend.modules.chat.repository;

import com.artivio.backend.modules.chat.model.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.artivio.backend.modules.chat.model.User;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {
    @Query("SELECT c FROM Chat c WHERE c.customer.id = :customerId AND c.artisan.id = :artisanId AND c.status = 'OPEN'")
    Optional<Chat> findOpenChat(Long customerId, Long artisanId);
    List<Chat> findByCustomerOrderByCreatedAtDesc(User customer);
}