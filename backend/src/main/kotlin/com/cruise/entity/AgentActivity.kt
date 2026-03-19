package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "agent_activity")
class AgentActivity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "agent_session_id", nullable = false)
    var agentSessionId: Long = 0,

    @Column(nullable = false, length = 50)
    var type: String = "message",

    @Column(columnDefinition = "TEXT")
    var content: String? = null,

    @Column(name = "issue_id")
    var issueId: Long? = null,

    @Column(name = "comment_id")
    var commentId: Long? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
