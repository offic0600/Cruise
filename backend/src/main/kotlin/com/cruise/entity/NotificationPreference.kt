package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notification_preference")
class NotificationPreference(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(nullable = false, length = 50)
    var category: String = "",

    @Column(nullable = false, length = 50)
    var channel: String = "in_app",

    @Column(nullable = false)
    var enabled: Boolean = true,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

