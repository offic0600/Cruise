package com.cruise.adapter

import com.cruise.service.IssueQuery
import com.cruise.service.IssueService
import org.springframework.stereotype.Component

@Component
class MockWorkHoursAdapter(
    private val issueService: IssueService
) : WorkHoursAdapter {

    override fun syncWorkHours(projectId: Long): SyncResult {
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val syncedCount = tasks.count { it.actualHours > 0 }
        return SyncResult(
            success = true,
            syncedCount = syncedCount,
            failedCount = 0,
            message = "成功同步 $syncedCount 条工时记录"
        )
    }

    override fun getWorkHoursSummary(projectId: Long): WorkHoursSummary {
        val tasks = issueService.findAll(IssueQuery(type = "TASK", projectId = projectId))
        val totalHours = tasks.sumOf { it.actualHours.toDouble() }
        val memberHours = tasks
            .filter { it.assigneeId != null }
            .groupBy { it.assigneeId.toString() }
            .mapValues { entry -> entry.value.sumOf { it.actualHours.toDouble() } }

        val dailyHours = mapOf(
            "2026-03-09" to 40.0,
            "2026-03-08" to 35.0,
            "2026-03-07" to 42.0,
            "2026-03-06" to 38.0,
            "2026-03-05" to 45.0
        )

        return WorkHoursSummary(
            projectId = projectId,
            totalHours = totalHours,
            memberHours = memberHours,
            dailyHours = dailyHours
        )
    }
}
