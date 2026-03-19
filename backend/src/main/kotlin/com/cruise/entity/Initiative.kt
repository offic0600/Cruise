package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "initiative")
class Initiative(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "parent_initiative_id")
    var parentInitiativeId: Long? = null,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(length = 64)
    var slugId: String? = null,

    @Column(length = 30, nullable = false)
    var status: String = "planned",

    @Column(length = 30)
    var health: String? = null,

    @Column(name = "owner_id")
    var ownerId: Long? = null,

    @Column(name = "creator_id")
    var creatorId: Long? = null,

    @Column(name = "target_date")
    var targetDate: LocalDate? = null,

    @Column(name = "started_at")
    var startedAt: LocalDateTime? = null,

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

