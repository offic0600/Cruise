package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "comment_entry")
class Comment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "issue_id")
    var issueId: Long? = null,

    @Column(name = "epic_id")
    var epicId: Long? = null,

    @Column(name = "doc_id")
    var docId: Long? = null,

    @Column(name = "parent_comment_id")
    var parentCommentId: Long? = null,

    @Column(name = "author_id", nullable = false)
    var authorId: Long = 0,

    @Column(nullable = false, length = 4000)
    var body: String = "",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
