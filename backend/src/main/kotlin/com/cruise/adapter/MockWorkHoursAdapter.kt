package com.cruise.adapter

import com.cruise.repository.TaskRepository
import org.springframework.stereotype.Component

/**
 * 工时系统模拟适配器（用于开发和测试）
 */
@Component
class MockWorkHoursAdapter(
    private val taskRepository: TaskRepository
) : WorkHoursAdapter {

    override fun syncWorkHours(projectId: Long): SyncResult {
        // 模拟从工时系统同步数据
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }
        val syncedCount = tasks.count { it.actualHours > 0 }

        return SyncResult(
            success = true,
            syncedCount = syncedCount,
            failedCount = 0,
            message = "成功同步 $syncedCount 条工时记录"
        )
    }

    override fun getWorkHoursSummary(projectId: Long): WorkHoursSummary {
        val tasks = taskRepository.findAll().filter { it.teamId == projectId }

        val totalHours = tasks.sumOf { it.actualHours.toDouble() }

        // 按成员汇总
        val memberHours = tasks
            .filter { it.assigneeId != null }
            .groupBy { it.assigneeId.toString() }
            .mapValues { entry -> entry.value.sumOf { it.actualHours.toDouble() } }

        // 模拟按日汇总（实际应从工时系统获取）
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
