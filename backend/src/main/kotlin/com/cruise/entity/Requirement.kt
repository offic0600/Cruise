package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "requirement")
class Requirement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 255)
    val title: String,

    @Column(length = 2000)
    val description: String? = null,

    @Column(length = 50)
    val status: String = "NEW",

    @Column(length = 20)
    val priority: String = "MEDIUM",

    @Column(name = "project_id", nullable = false)
    val projectId: Long,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)