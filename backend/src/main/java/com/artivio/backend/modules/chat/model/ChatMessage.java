package com.artivio.backend.modules.chat.model;

import com.artivio.backend.modules.chat.model.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false)
    private SenderType senderType;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_image")
    private boolean isImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private EnumMessageType type;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;


    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    public enum SenderType { CUSTOMER, ARTISAN }
    public enum EnumMessageType { TEXT, IMAGE, ORDER_PROPOSAL }
}