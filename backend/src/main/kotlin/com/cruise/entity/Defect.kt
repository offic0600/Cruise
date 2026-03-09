package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "defect")
class Defect(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 255)
    val title: String,

    @Column(length = 2000)
    val description: String? = null,

    @Column(length = 20)
    val severity: String = "MEDIUM",

    @Column(length = 50)
    val status: String = "OPEN",

    @Column(name = "project_id", nullable = false)
    val projectId: Long,

    @Column(name = "task_id")
    val taskId: Long? = null,

    @Column(name = "reporter_id")
    val reporterId: Long? = null,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        title = "",
        description = null,
        severity = "MEDIUM",
        status = "OPEN",
        projectId = 0,
        taskId = null,
        reporterId = null,
        createdAt = java.time.LocalDateTime.now(),
        updatedAt = java.time.LocalDateTime.now()
    )
}
