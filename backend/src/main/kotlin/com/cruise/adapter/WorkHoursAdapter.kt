package com.cruise.adapter

/**
 * 工时系统适配器接口
 */
interface WorkHoursAdapter {
    /**
     * 同步工时数据
     * @param projectId 项目 ID
     * @return 同步结果
     */
    fun syncWorkHours(projectId: Long): SyncResult

    /**
     * 获取工时汇总
     * @param projectId 项目 ID
     * @return 工时汇总
     */
    fun getWorkHoursSummary(projectId: Long): WorkHoursSummary
}

/**
 * 同步结果
 */
data class SyncResult(
    val success: Boolean,
    val syncedCount: Int,
    val failedCount: Int,
    val message: String
)

/**
 * 工时汇总
 */
data class WorkHoursSummary(
    val projectId: Long,
    val totalHours: Double,
    val memberHours: Map<String, Double>,
    val dailyHours: Map<String, Double>
)
