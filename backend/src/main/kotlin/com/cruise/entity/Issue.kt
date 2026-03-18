package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "issue")
class Issue(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(nullable = false, length = 50, unique = true)
    var identifier: String = "",

    @Column(nullable = false, length = 30)
    var type: String = "TASK",

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 4000)
    var description: String? = null,

    @Column(nullable = false, length = 50)
    var state: String = "TODO",

    @Column(length = 30)
    var resolution: String? = null,

    @Column(nullable = false, length = 20)
    var priority: String = "MEDIUM",

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "parent_issue_id")
    var parentIssueId: Long? = null,

    @Column(name = "assignee_id")
    var assigneeId: Long? = null,

    @Column(name = "reporter_id")
    var reporterId: Long? = null,

    @Column(name = "estimate_points")
    var estimatePoints: Int? = null,

    @Column
    var progress: Int = 0,

    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedStartDate: LocalDate? = null,

    @Column(name = "planned_end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedEndDate: LocalDate? = null,

    @Column(name = "estimated_hours")
    var estimatedHours: Float = 0f,

    @Column(name = "actual_hours")
    var actualHours: Float = 0f,

    @Column(length = 20)
    var severity: String? = null,

    @Column(name = "source_type", nullable = false, length = 30)
    var sourceType: String = "NATIVE",

    @Column(name = "source_id")
    var sourceId: Long? = null,

    @Column(name = "legacy_payload", length = 4000)
    var legacyPayload: String? = null,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
