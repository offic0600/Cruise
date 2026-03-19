package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "issue_template")
class IssueTemplate(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 255)
    var title: String? = null,

    @Column(length = 4000)
    var description: String? = null,

    @Column(nullable = false, length = 30)
    var type: String = "TASK",

    @Column(length = 50)
    var state: String? = null,

    @Column(length = 20)
    var priority: String? = null,

    @Column(name = "assignee_id")
    var assigneeId: Long? = null,

    @Column(name = "estimate_points")
    var estimatePoints: Int? = null,

    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedStartDate: LocalDate? = null,

    @Column(name = "planned_end_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedEndDate: LocalDate? = null,

    @Column(name = "legacy_payload", length = 4000)
    var legacyPayload: String? = null,

    @Column(name = "custom_fields_json", length = 4000)
    var customFieldsJson: String? = null,

    @Column(name = "label_ids_json", length = 4000)
    var labelIdsJson: String? = null,

    @Column(name = "sub_issues_json", length = 4000)
    var subIssuesJson: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
