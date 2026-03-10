package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "defect")
class Defect(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 2000)
    var description: String? = null,

    @Column(length = 20)
    var severity: String = "MEDIUM",

    @Column(length = 50)
    var status: String = "OPEN",

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(name = "task_id")
    var taskId: Long? = null,

    @Column(name = "reporter_id")
    var reporterId: Long? = null,

    @Column(name = "created_at")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
