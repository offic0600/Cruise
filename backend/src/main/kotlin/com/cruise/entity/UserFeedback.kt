package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "user_feedback")
@JsonIgnoreProperties(ignoreUnknown = true)
class UserFeedback(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "session_id", length = 100)
    val sessionId: String? = null,

    @Column(name = "execution_log_id")
    val executionLogId: Long? = null,

    @Column(name = "skill_name", length = 100)
    val skillName: String? = null,

    @Column(name = "user_id")
    val userId: Long? = null,

    @Column(nullable = false)
    val rating: Int,

    @Column(columnDefinition = "TEXT")
    val comment: String? = null,

    @Column(name = "feedback_type", length = 50)
    val feedbackType: String = "GENERAL",

    @Column(name = "is_positive")
    val isPositive: Boolean = true,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    constructor() : this(
        id = 0,
        rating = 0,
        createdAt = LocalDateTime.now()
    )
}
