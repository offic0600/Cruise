package com.cruise.entity

import jakarta.persistence.*

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

    @Column(name = "estimated_hours")
    val estimatedHours: Float = 0f,

    @Column(name = "actual_hours")
    val actualHours: Float = 0f,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)