package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "legacy_issue_mapping",
    uniqueConstraints = [UniqueConstraint(columnNames = ["source_type", "source_id"])]
)
class LegacyIssueMapping(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "source_type", nullable = false, length = 30)
    var sourceType: String = "",

    @Column(name = "source_id", nullable = false)
    var sourceId: Long = 0,

    @Column(name = "issue_id", nullable = false)
    var issueId: Long = 0
)
