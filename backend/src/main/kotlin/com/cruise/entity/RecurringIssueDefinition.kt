package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "recurring_issue_definition")
class RecurringIssueDefinition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 1,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(name = "template_id")
    var templateId: Long? = null,

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

    @Column(name = "cadence_type", nullable = false, length = 20)
    var cadenceType: String = "DAILY",

    @Column(name = "cadence_interval", nullable = false)
    var cadenceInterval: Int = 1,

    @Column(name = "weekdays_csv", length = 100)
    var weekdaysCsv: String? = null,

    @Column(name = "next_run_at", nullable = false)
    var nextRunAt: LocalDateTime = LocalDateTime.now(),

    @Column(nullable = false)
    var active: Boolean = true,

    @Column(name = "legacy_payload", length = 4000)
    var legacyPayload: String? = null,

    @Column(name = "custom_fields_json", length = 4000)
    var customFieldsJson: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
