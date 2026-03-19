package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "notification")
class Notification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(name = "event_id", nullable = false)
    var eventId: Long = 0,

    @Column(name = "actor_id")
    var actorId: Long? = null,

    @Column(nullable = false, length = 30)
    var type: String = "SYSTEM",

    @Column(nullable = false, length = 50)
    var category: String = "system",

    @Column(name = "resource_type", length = 50)
    var resourceType: String? = null,

    @Column(name = "resource_id")
    var resourceId: Long? = null,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(nullable = false, length = 2000)
    var body: String = "",

    @Column(name = "payload_json", length = 4000)
    var payloadJson: String? = null,

    @Column(name = "read_at")
    var readAt: LocalDateTime? = null,

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)
