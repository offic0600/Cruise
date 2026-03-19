package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "entity_external_link")
class EntityExternalLink(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "entity_type", nullable = false, length = 50)
    var entityType: String = "",

    @Column(name = "entity_id", nullable = false)
    var entityId: Long = 0,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(nullable = false, length = 1000)
    var url: String = "",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

