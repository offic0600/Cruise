package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "activity_event")
class ActivityEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "actor_id")
    var actorId: Long? = null,

    @Column(name = "entity_type", nullable = false, length = 30)
    var entityType: String = "ISSUE",

    @Column(name = "entity_id", nullable = false)
    var entityId: Long = 0,

    @Column(name = "action_type", nullable = false, length = 50)
    var eventType: String = "CREATED",

    @Column(nullable = false, length = 1000)
    var summary: String = "",

    @Column(name = "payload_json", length = 4000)
    var payloadJson: String? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
