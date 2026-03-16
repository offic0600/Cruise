package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "issue_relation")
class IssueRelation(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "from_issue_id", nullable = false)
    var fromIssueId: Long = 0,

    @Column(name = "to_issue_id", nullable = false)
    var toIssueId: Long = 0,

    @Column(name = "relation_type", nullable = false, length = 30)
    var relationType: String = "RELATES_TO",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
