package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "issue_label")
class IssueLabel(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "issue_id", nullable = false)
    var issueId: Long = 0,

    @Column(name = "label_id", nullable = false)
    var labelId: Long = 0,

    @Column(name = "applied_by")
    var appliedBy: Long? = null,

    @Column(name = "applied_at", nullable = false)
    var appliedAt: LocalDateTime = LocalDateTime.now()
)
