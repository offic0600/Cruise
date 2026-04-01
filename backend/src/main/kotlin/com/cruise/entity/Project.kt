package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "project")
class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_key", unique = true, length = 30)
    var key: String? = null,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(length = 50)
    var status: String = "ACTIVE",

    @Column(length = 20)
    var priority: String? = null,

    @Column(name = "owner_id")
    var ownerId: Long? = null,

    @Column(name = "start_date")
    var startDate: java.time.LocalDate? = null,

    @Column(name = "target_date")
    var targetDate: java.time.LocalDate? = null,

    @Column(name = "created_at")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: java.time.LocalDateTime? = null
)
