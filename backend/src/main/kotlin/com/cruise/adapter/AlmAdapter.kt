package com.cruise.adapter

import com.cruise.entity.Requirement

/**
 * ALM 系统适配器接口
 * 用于对接各类 ALM 系统（Jira、Azure DevOps 等）
 */
interface AlmAdapter {
    /**
     * 从 ALM 系统同步需求
     * @return 同步的需求列表
     */
    fun syncRequirements(): List<AlmRequirement>

    /**
     * 推送需求到 ALM 系统
     * @param requirement 需求对象
     * @return 是否推送成功
     */
    fun pushRequirement(requirement: Requirement): Boolean

    /**
     * 获取同步状态
     * @return 同步状态列表
     */
    fun getSyncStatus(): List<SyncStatus>
}

/**
 * ALM 需求数据
 */
data class AlmRequirement(
    val externalId: String,
    val title: String,
    val description: String,
    val status: String,
    val priority: String,
    val projectKey: String
)

/**
 * 同步状态
 */
data class SyncStatus(
    val entityType: String,
    val entityId: Long,
    val externalId: String?,
    val lastSyncTime: String,
    val status: String
)
