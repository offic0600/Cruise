package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "notification_subscription")
class NotificationSubscription(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(name = "resource_type", nullable = false, length = 50)
    var resourceType: String = "",

    @Column(name = "resource_id", nullable = false)
    var resourceId: Long = 0,

    @Column(name = "event_key", length = 100)
    var eventKey: String? = null,

    @Column(nullable = false)
    var active: Boolean = true,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)
