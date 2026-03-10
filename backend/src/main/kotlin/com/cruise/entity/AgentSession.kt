package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "agent_session")
@JsonIgnoreProperties(ignoreUnknown = true)
class AgentSession(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "session_id", nullable = false, unique = true, length = 100)
    val sessionId: String,

    @Column(name = "user_id")
    val userId: Long? = null,

    @Column(name = "user_name", length = 100)
    val userName: String? = null,

    @Column(name = "current_intent", length = 100)
    val currentIntent: String? = null,

    @Column(name = "context", columnDefinition = "TEXT")
    val context: String? = null,

    @Column(length = 50)
    val status: String = "ACTIVE",

    @Column(name = "message_count")
    val messageCount: Int = 0,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "ended_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val endedAt: LocalDateTime? = null
) {
    constructor() : this(
        id = 0,
        sessionId = "",
        createdAt = LocalDateTime.now(),
        updatedAt = LocalDateTime.now()
    )
}
