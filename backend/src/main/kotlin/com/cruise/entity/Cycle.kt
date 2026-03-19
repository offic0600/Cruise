package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "cycle")
class Cycle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id", nullable = false)
    var teamId: Long = 0,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(nullable = false)
    var number: Int = 1,

    @Column(name = "starts_at")
    var startsAt: LocalDate? = null,

    @Column(name = "ends_at")
    var endsAt: LocalDate? = null,

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

