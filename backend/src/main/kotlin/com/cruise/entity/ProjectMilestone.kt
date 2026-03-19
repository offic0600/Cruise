package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "project_milestone")
class ProjectMilestone(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(name = "target_date")
    var targetDate: LocalDate? = null,

    @Column(length = 30)
    var status: String = "planned",

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "archived_at")
    var archivedAt: LocalDateTime? = null
)

