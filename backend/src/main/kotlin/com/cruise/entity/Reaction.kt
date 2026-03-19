package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "reaction")
class Reaction(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(name = "issue_id")
    var issueId: Long? = null,

    @Column(name = "comment_id")
    var commentId: Long? = null,

    @Column(name = "project_update_id")
    var projectUpdateId: Long? = null,

    @Column(name = "initiative_update_id")
    var initiativeUpdateId: Long? = null,

    @Column(nullable = false, length = 64)
    var emoji: String = "",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)

