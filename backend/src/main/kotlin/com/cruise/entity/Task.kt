package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "task")
class Task(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 255)
    val title: String,

    @Column(length = 2000)
    val description: String? = null,

    @Column(length = 50)
    val status: String = "PENDING",

    @Column(name = "requirement_id", nullable = false)
    val requirementId: Long,

    @Column(name = "assignee_id")
    val assigneeId: Long? = null,

    // 开发进度
    @Column
    val progress: Int = 0,

    // 所属团队
    @Column(name = "team_id")
    val teamId: Long? = null,

    // 计划开始时间
    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val plannedStartDate: LocalDate? = null,

    // 计划完成时间
    @Column(name = "planned_end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val plannedEndDate: LocalDate? = null,

    // 任务评估人天（传统开发）
    @Column(name = "estimated_days")
    val estimatedDays: Float? = null,

    // 任务计划人天（AI开发）
    @Column(name = "planned_days")
    val plannedDays: Float? = null,

    // 剩余人天
    @Column(name = "remaining_days")
    val remainingDays: Float? = null,

    // 预估工时（保留兼容）
    @Column(name = "estimated_hours")
    val estimatedHours: Float = 0f,

    // 实际工时（保留兼容）
    @Column(name = "actual_hours")
    val actualHours: Float = 0f,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        title = "",
        description = null,
        status = "PENDING",
        requirementId = 0,
        assigneeId = null,
        estimatedHours = 0f,
        actualHours = 0f,
        createdAt = java.time.LocalDateTime.now(),
        updatedAt = java.time.LocalDateTime.now()
    )
}
