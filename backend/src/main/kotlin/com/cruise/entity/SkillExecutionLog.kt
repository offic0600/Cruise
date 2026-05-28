package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "skill_execution_log")
@JsonIgnoreProperties(ignoreUnknown = true)
class SkillExecutionLog(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "session_id", length = 100)
    val sessionId: String? = null,

    @Column(name = "skill_name", nullable = false, length = 100)
    val skillName: String,

    @Column(name = "user_id")
    val userId: Long? = null,

    @Lob
    @Column(name = "input_data")
    val inputData: String? = null,

    @Lob
    @Column(name = "output_data")
    val outputData: String? = null,

    @Column(length = 50)
    val status: String = "SUCCESS",

    @Lob
    @Column(name = "error_message")
    val errorMessage: String? = null,

    @Column(name = "execution_time_ms")
    val executionTimeMs: Long = 0,

    @Column(name = "confidence_score")
    val confidenceScore: Float? = null,

    @Column(name = "feedback_score")
    val feedbackScore: Int? = null,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime = LocalDateTime.now()
) {
    constructor() : this(
        id = 0,
        skillName = "",
        createdAt = LocalDateTime.now()
    )
}
