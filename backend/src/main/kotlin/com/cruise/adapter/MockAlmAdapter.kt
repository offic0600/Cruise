package com.cruise.adapter

import com.cruise.entity.Requirement
import org.springframework.stereotype.Component
import java.time.LocalDateTime

/**
 * ALM 模拟适配器（用于开发和测试）
 */
@Component
class MockAlmAdapter : AlmAdapter {

    private val syncHistory = mutableListOf<SyncStatus>()

    override fun syncRequirements(): List<AlmRequirement> {
        // 模拟从 ALM 系统拉取的需求
        return listOf(
            AlmRequirement(
                externalId = "JIRA-101",
                title = "用户登录功能",
                description = "实现用户登录功能",
                status = "In Progress",
                priority = "High",
                projectKey = "CRUISE"
            ),
            AlmRequirement(
                externalId = "JIRA-102",
                title = "用户注册功能",
                description = "实现用户注册功能",
                status = "To Do",
                priority = "High",
                projectKey = "CRUISE"
            ),
            AlmRequirement(
                externalId = "JIRA-103",
                title = "密码找回功能",
                description = "实现密码找回功能",
                status = "To Do",
                priority = "Medium",
                projectKey = "CRUISE"
            )
        ).also {
            // 记录同步状态
            syncHistory.add(
                SyncStatus(
                    entityType = "REQUIREMENT",
                    entityId = 0,
                    externalId = "BATCH-${System.currentTimeMillis()}",
                    lastSyncTime = LocalDateTime.now().toString(),
                    status = "SUCCESS"
                )
            )
        }
    }

    override fun pushRequirement(requirement: Requirement): Boolean {
        // 模拟推送成功
        syncHistory.add(
            SyncStatus(
                entityType = "REQUIREMENT",
                entityId = requirement.id,
                externalId = "JIRA-${1000 + requirement.id}",
                lastSyncTime = LocalDateTime.now().toString(),
                status = "SUCCESS"
            )
        )
        return true
    }

    override fun getSyncStatus(): List<SyncStatus> = syncHistory.toList()
}
