package com.cruise.config

import com.cruise.entity.Issue
import com.cruise.entity.IssueTag
import com.cruise.repository.IssueRepository
import com.cruise.repository.IssueTagRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.annotation.Order
import org.springframework.jdbc.core.JdbcTemplate
import java.sql.ResultSet
import java.time.LocalDate
import java.time.LocalDateTime

@Configuration
open class LegacyDataMigrationConfig {

    @Bean
    @Order(0)
    open fun migrateLegacyData(
        jdbcTemplate: JdbcTemplate,
        issueRepository: IssueRepository,
        issueTagRepository: IssueTagRepository
    ): CommandLineRunner {
        return CommandLineRunner {
            migrateLegacyIssueTags(jdbcTemplate, issueTagRepository)
            migrateLegacyIssues(jdbcTemplate, issueRepository)
        }
    }

    private fun migrateLegacyIssueTags(
        jdbcTemplate: JdbcTemplate,
        issueTagRepository: IssueTagRepository
    ) {
        if (!tableExists(jdbcTemplate, "REQUIREMENT_TAG")) return
        if (issueTagRepository.count() > 0L) return

        val tags = jdbcTemplate.query(
            "select id, name, color, sort_order, created_at from requirement_tag order by id"
        ) { rs, _ -> rs.toIssueTag() }

        if (tags.isNotEmpty()) {
            issueTagRepository.saveAll(tags)
        }
    }

    private fun migrateLegacyIssues(
        jdbcTemplate: JdbcTemplate,
        issueRepository: IssueRepository
    ) {
        if (issueRepository.count() > 0L) return
        if (!tableExists(jdbcTemplate, "REQUIREMENT") &&
            !tableExists(jdbcTemplate, "TASK") &&
            !tableExists(jdbcTemplate, "DEFECT")
        ) {
            return
        }

        val requirementIdMap = linkedMapOf<Long, Long>()
        val requirementProjectMap = linkedMapOf<Long, Long?>()
        val taskIdMap = linkedMapOf<Long, Long>()
        val taskProjectMap = linkedMapOf<Long, Long?>()

        if (tableExists(jdbcTemplate, "REQUIREMENT")) {
            val requirements = jdbcTemplate.query(
                """
                select id, title, description, status, priority, project_id, team_id, planned_start_date,
                       expected_delivery_date, requirement_owner_id, product_owner_id, dev_owner_id, dev_participants,
                       test_owner_id, progress, tags, estimated_days, planned_days, gap_days, gap_budget, actual_days,
                       application_codes, vendors, vendor_staff, created_by, created_at, updated_at
                from requirement
                order by id
                """.trimIndent()
            ) { rs, _ -> rs.toRequirementRow() }

            requirements.forEachIndexed { index, row ->
                val saved = issueRepository.save(
                    Issue(
                        identifier = "ISSUE-${index + 1}",
                        type = "FEATURE",
                        title = row.title,
                        description = row.description,
                        state = mapRequirementState(row.status),
                        priority = mapPriority(row.priority),
                        projectId = row.projectId,
                        teamId = row.teamId,
                        assigneeId = row.requirementOwnerId,
                        reporterId = null,
                        progress = row.progress,
                        plannedStartDate = row.plannedStartDate,
                        plannedEndDate = row.expectedDeliveryDate,
                        sourceType = "REQUIREMENT",
                        sourceId = row.id,
                        createdAt = row.createdAt,
                        updatedAt = row.updatedAt
                    )
                )
                requirementIdMap[row.id] = saved.id
                requirementProjectMap[row.id] = saved.projectId
            }
        }

        if (tableExists(jdbcTemplate, "TASK")) {
            val base = issueRepository.count().toInt()
            val tasks = jdbcTemplate.query(
                """
                select id, title, description, status, requirement_id, assignee_id, progress, team_id,
                       planned_start_date, planned_end_date, estimated_days, planned_days, remaining_days,
                       estimated_hours, actual_hours, created_at, updated_at
                from task
                order by id
                """.trimIndent()
            ) { rs, _ -> rs.toTaskRow() }

            tasks.forEachIndexed { index, row ->
                val parentIssueId = requirementIdMap[row.requirementId]
                val projectId = requirementProjectMap[row.requirementId] ?: 1L
                val saved = issueRepository.save(
                    Issue(
                        identifier = "ISSUE-${base + index + 1}",
                        type = "TASK",
                        title = row.title,
                        description = row.description,
                        state = mapTaskState(row.status),
                        priority = "MEDIUM",
                        projectId = projectId,
                        teamId = row.teamId,
                        parentIssueId = parentIssueId,
                        assigneeId = row.assigneeId,
                        progress = row.progress,
                        plannedStartDate = row.plannedStartDate,
                        plannedEndDate = row.plannedEndDate,
                        estimatedHours = row.estimatedHours,
                        actualHours = row.actualHours,
                        sourceType = "TASK",
                        sourceId = row.id,
                        createdAt = row.createdAt,
                        updatedAt = row.updatedAt
                    )
                )
                taskIdMap[row.id] = saved.id
                taskProjectMap[row.id] = saved.projectId
            }
        }

        if (tableExists(jdbcTemplate, "DEFECT")) {
            val base = issueRepository.count().toInt()
            val defects = jdbcTemplate.query(
                """
                select id, title, description, severity, status, project_id, task_id, reporter_id, created_at, updated_at
                from defect
                order by id
                """.trimIndent()
            ) { rs, _ -> rs.toDefectRow() }

            defects.forEachIndexed { index, row ->
                val parentIssueId = row.taskId?.let(taskIdMap::get)
                val projectId = row.taskId?.let(taskProjectMap::get) ?: row.projectId
                issueRepository.save(
                    Issue(
                        identifier = "ISSUE-${base + index + 1}",
                        type = "BUG",
                        title = row.title,
                        description = row.description,
                        state = mapDefectState(row.status),
                        priority = mapSeverityPriority(row.severity),
                        projectId = projectId,
                        parentIssueId = parentIssueId,
                        reporterId = row.reporterId,
                        severity = row.severity,
                        sourceType = "DEFECT",
                        sourceId = row.id,
                        createdAt = row.createdAt,
                        updatedAt = row.updatedAt
                    )
                )
            }
        }
    }

    private fun tableExists(jdbcTemplate: JdbcTemplate, tableName: String): Boolean =
        (jdbcTemplate.queryForObject(
            """
            select count(*)
            from information_schema.tables
            where upper(table_name) = ?
            """.trimIndent(),
            Long::class.java,
            tableName.uppercase()
        ) ?: 0L) > 0L

    private fun mapRequirementState(status: String?): String = when (status?.uppercase()) {
        "NEW" -> "BACKLOG"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "TESTING" -> "IN_REVIEW"
        "COMPLETED" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "BACKLOG"
    }

    private fun mapTaskState(status: String?): String = when (status?.uppercase()) {
        "PENDING" -> "TODO"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "COMPLETED" -> "DONE"
        "CANCELLED" -> "CANCELED"
        else -> "TODO"
    }

    private fun mapDefectState(status: String?): String = when (status?.uppercase()) {
        "OPEN" -> "TODO"
        "IN_PROGRESS" -> "IN_PROGRESS"
        "RESOLVED" -> "IN_REVIEW"
        "CLOSED" -> "DONE"
        "REOPENED" -> "TODO"
        else -> "TODO"
    }

    private fun mapPriority(priority: String?): String = when (priority?.uppercase()) {
        "LOW", "MEDIUM", "HIGH", "URGENT" -> priority.uppercase()
        "CRITICAL" -> "URGENT"
        else -> "MEDIUM"
    }

    private fun mapSeverityPriority(severity: String?): String = when (severity?.uppercase()) {
        "CRITICAL", "HIGH" -> "HIGH"
        "LOW" -> "LOW"
        else -> "MEDIUM"
    }

    private fun ResultSet.toIssueTag(): IssueTag = IssueTag(
        id = getLong("id"),
        name = getString("name"),
        color = getString("color") ?: "#3B82F6",
        sortOrder = getInt("sort_order"),
        createdAt = getTimestamp("created_at")?.toLocalDateTime() ?: LocalDateTime.now()
    )

    private fun ResultSet.toRequirementRow(): RequirementRow = RequirementRow(
        id = getLong("id"),
        title = getString("title"),
        description = getString("description"),
        status = getString("status"),
        priority = getString("priority"),
        projectId = getLong("project_id"),
        teamId = getNullableLong("team_id"),
        plannedStartDate = getDate("planned_start_date")?.toLocalDate(),
        expectedDeliveryDate = getDate("expected_delivery_date")?.toLocalDate(),
        requirementOwnerId = getNullableLong("requirement_owner_id"),
        productOwnerId = getNullableLong("product_owner_id"),
        devOwnerId = getNullableLong("dev_owner_id"),
        devParticipants = getString("dev_participants"),
        testOwnerId = getNullableLong("test_owner_id"),
        progress = getInt("progress"),
        tags = getString("tags"),
        estimatedDays = getNullableFloat("estimated_days"),
        plannedDays = getNullableFloat("planned_days"),
        gapDays = getNullableFloat("gap_days"),
        gapBudget = getNullableFloat("gap_budget"),
        actualDays = getNullableFloat("actual_days"),
        applicationCodes = getString("application_codes"),
        vendors = getString("vendors"),
        vendorStaff = getString("vendor_staff"),
        createdBy = getString("created_by"),
        createdAt = getTimestamp("created_at")?.toLocalDateTime() ?: LocalDateTime.now(),
        updatedAt = getTimestamp("updated_at")?.toLocalDateTime() ?: LocalDateTime.now()
    )

    private fun ResultSet.toTaskRow(): TaskRow = TaskRow(
        id = getLong("id"),
        title = getString("title"),
        description = getString("description"),
        status = getString("status"),
        requirementId = getLong("requirement_id"),
        assigneeId = getNullableLong("assignee_id"),
        progress = getInt("progress"),
        teamId = getNullableLong("team_id"),
        plannedStartDate = getDate("planned_start_date")?.toLocalDate(),
        plannedEndDate = getDate("planned_end_date")?.toLocalDate(),
        estimatedDays = getNullableFloat("estimated_days"),
        plannedDays = getNullableFloat("planned_days"),
        remainingDays = getNullableFloat("remaining_days"),
        estimatedHours = getFloat("estimated_hours"),
        actualHours = getFloat("actual_hours"),
        createdAt = getTimestamp("created_at")?.toLocalDateTime() ?: LocalDateTime.now(),
        updatedAt = getTimestamp("updated_at")?.toLocalDateTime() ?: LocalDateTime.now()
    )

    private fun ResultSet.toDefectRow(): DefectRow = DefectRow(
        id = getLong("id"),
        title = getString("title"),
        description = getString("description"),
        severity = getString("severity"),
        status = getString("status"),
        projectId = getLong("project_id"),
        taskId = getNullableLong("task_id"),
        reporterId = getNullableLong("reporter_id"),
        createdAt = getTimestamp("created_at")?.toLocalDateTime() ?: LocalDateTime.now(),
        updatedAt = getTimestamp("updated_at")?.toLocalDateTime() ?: LocalDateTime.now()
    )

    private fun ResultSet.getNullableLong(column: String): Long? =
        getLong(column).let { if (wasNull()) null else it }

    private fun ResultSet.getNullableFloat(column: String): Float? =
        getFloat(column).let { if (wasNull()) null else it }
}

private data class RequirementRow(
    val id: Long,
    val title: String,
    val description: String?,
    val status: String?,
    val priority: String?,
    val projectId: Long,
    val teamId: Long?,
    val plannedStartDate: LocalDate?,
    val expectedDeliveryDate: LocalDate?,
    val requirementOwnerId: Long?,
    val productOwnerId: Long?,
    val devOwnerId: Long?,
    val devParticipants: String?,
    val testOwnerId: Long?,
    val progress: Int,
    val tags: String?,
    val estimatedDays: Float?,
    val plannedDays: Float?,
    val gapDays: Float?,
    val gapBudget: Float?,
    val actualDays: Float?,
    val applicationCodes: String?,
    val vendors: String?,
    val vendorStaff: String?,
    val createdBy: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

private data class TaskRow(
    val id: Long,
    val title: String,
    val description: String?,
    val status: String?,
    val requirementId: Long,
    val assigneeId: Long?,
    val progress: Int,
    val teamId: Long?,
    val plannedStartDate: LocalDate?,
    val plannedEndDate: LocalDate?,
    val estimatedDays: Float?,
    val plannedDays: Float?,
    val remainingDays: Float?,
    val estimatedHours: Float,
    val actualHours: Float,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

private data class DefectRow(
    val id: Long,
    val title: String,
    val description: String?,
    val severity: String?,
    val status: String?,
    val projectId: Long,
    val taskId: Long?,
    val reporterId: Long?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
