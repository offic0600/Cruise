package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "epic")
class Epic(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id", nullable = false)
    var teamId: Long = 1,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(nullable = false, unique = true, length = 50)
    var identifier: String = "",

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 4000)
    var description: String? = null,

    @Column(nullable = false, length = 50)
    var state: String = "BACKLOG",

    @Column(nullable = false, length = 20)
    var priority: String = "MEDIUM",

    @Column(name = "owner_id")
    var ownerId: Long? = null,

    @Column(name = "reporter_id")
    var reporterId: Long? = null,

    @Column(name = "start_date")
    var startDate: LocalDate? = null,

    @Column(name = "target_date")
    var targetDate: LocalDate? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
