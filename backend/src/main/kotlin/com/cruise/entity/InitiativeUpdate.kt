package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "initiative_update")
class InitiativeUpdate(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "initiative_id", nullable = false)
    var initiativeId: Long = 0,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 4000)
    var body: String? = null,

    @Column(length = 30)
    var health: String? = null,

    @Column(name = "user_id")
    var userId: Long? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

