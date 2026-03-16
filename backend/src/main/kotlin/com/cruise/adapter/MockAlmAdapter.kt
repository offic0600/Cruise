package com.cruise.adapter

import com.cruise.service.IssueDto
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class MockAlmAdapter : AlmAdapter {
    private val syncHistory = mutableListOf<SyncStatus>()

    override fun syncIssues(): List<AlmIssue> =
        listOf(
            AlmIssue("ALM-101", "统一登录流程", "补齐认证和权限校验流程", "IN_PROGRESS", "HIGH", "CRUISE"),
            AlmIssue("ALM-102", "Issue 统一看板", "将需求任务缺陷统一投影为 Issue 视图", "TODO", "HIGH", "CRUISE"),
            AlmIssue("ALM-103", "团队迭代统计", "新增统一工作项统计与趋势分析", "TODO", "MEDIUM", "CRUISE")
        ).also {
            syncHistory.add(
                SyncStatus(
                    entityType = "ISSUE",
                    entityId = 0,
                    externalId = "BATCH-${System.currentTimeMillis()}",
                    lastSyncTime = LocalDateTime.now().toString(),
                    status = "SUCCESS"
                )
            )
        }

    override fun pushIssue(issue: IssueDto): Boolean {
        syncHistory.add(
            SyncStatus(
                entityType = "ISSUE",
                entityId = issue.id,
                externalId = "ALM-${1000 + issue.id}",
                lastSyncTime = LocalDateTime.now().toString(),
                status = "SUCCESS"
            )
        )
        return true
    }

    override fun getSyncStatus(): List<SyncStatus> = syncHistory.toList()
}
