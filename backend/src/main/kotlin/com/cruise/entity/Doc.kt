package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "doc")
class Doc(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(name = "issue_id")
    var issueId: Long? = null,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(nullable = false, unique = true, length = 255)
    var slug: String = "",

    @Column(nullable = false, length = 30)
    var status: String = "DRAFT",

    @Column(name = "author_id", nullable = false)
    var authorId: Long = 0,

    @Column(name = "current_revision_id")
    var currentRevisionId: Long? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
