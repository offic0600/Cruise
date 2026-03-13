package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "skill_definition")
@JsonIgnoreProperties(ignoreUnknown = true)
class SkillDefinition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val name: String,

    @Column(length = 500)
    val description: String? = null,

    @Column(length = 50)
    val category: String? = null,

    @Column(name = "intent_patterns", columnDefinition = "TEXT")
    val intentPatterns: String? = null,

    @Column(columnDefinition = "TEXT")
    val parameters: String? = null,

    @Column(columnDefinition = "TEXT")
    val outputSchema: String? = null,

    @Column(length = 50)
    val status: String = "ACTIVE",

    @Column(name = "execution_count")
    val executionCount: Int = 0,

    @Column(name = "success_rate")
    val successRate: Float = 1.0f,

    @Column(name = "avg_execution_time_ms")
    val avgExecutionTimeMs: Long = 0,

    @Column(name = "version", length = 20)
    val version: String = "1.0.0",

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val updatedAt: LocalDateTime = LocalDateTime.now()
) {
    constructor() : this(
        id = 0,
        name = "",
        createdAt = LocalDateTime.now(),
        updatedAt = LocalDateTime.now()
    )
}
