package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "task")
class Task(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 2000)
    var description: String? = null,

    @Column(length = 50)
    var status: String = "PENDING",

    @Column(name = "requirement_id", nullable = false)
    var requirementId: Long = 0,

    @Column(name = "assignee_id")
    var assigneeId: Long? = null,

    @Column
    var progress: Int = 0,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedStartDate: LocalDate? = null,

    @Column(name = "planned_end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedEndDate: LocalDate? = null,

    @Column(name = "estimated_days")
    var estimatedDays: Float? = null,

    @Column(name = "planned_days")
    var plannedDays: Float? = null,

    @Column(name = "remaining_days")
    var remainingDays: Float? = null,

    @Column(name = "estimated_hours")
    var estimatedHours: Float = 0f,

    @Column(name = "actual_hours")
    var actualHours: Float = 0f,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
