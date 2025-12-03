package com.artivio.backend.modules.chat.model;

import com.artivio.backend.modules.chat.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne
    @JoinColumn(name = "artisan_id", nullable = false)
    private User artisan;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "enum('OPEN','CLOSED')")
    private ChatStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = ChatStatus.OPEN;
    }

    public enum ChatStatus { OPEN, CLOSED }
}