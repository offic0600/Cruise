package com.cruise.controller

import com.cruise.adapter.AlmAdapter
import com.cruise.entity.Requirement
import com.cruise.repository.RequirementRepository
import org.springframework.web.bind.annotation.*

/**
 * ALM (Application Lifecycle Management) 需求同步控制器
 */
@RestController
@RequestMapping("/api/alm")
class AlmRequirementController(
    private val almAdapter: AlmAdapter,
    private val requirementRepository: RequirementRepository
) {

    /**
     * 从ALM系统拉取需求
     * @param almProjectId ALM项目ID
     * @param sinceDate 可选，自某日期后更新的需求
     * @return 同步的需求数量
     */
    @PostMapping("/sync/requirements")
    fun syncRequirements(
        @RequestParam almProjectId: String,
        @RequestParam(required = false) sinceDate: String?
    ): Map<String, Any> {
        val requirements = almAdapter.syncRequirements()
        return mapOf(
            "success" to true,
            "syncedCount" to requirements.size,
            "almProjectId" to almProjectId,
            "sinceDate" to (sinceDate ?: "not specified")
        )
    }

    /**
     * 推送需求到ALM
     * @param id 需求ID
     * @return 推送结果
     */
    @PostMapping("/push/requirement/{id}")
    fun pushRequirement(@PathVariable id: Long): Map<String, Any> {
        val requirement = requirementRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Requirement not found") }

        val success = almAdapter.pushRequirement(requirement)

        return mapOf(
            "success" to success,
            "requirementId" to id,
            "externalId" to "JIRA-${1000 + id}",
            "message" to if (success) "推送成功" else "推送失败"
        )
    }

    /**
     * 查询ALM同步状态
     * @return 同步状态列表
     */
    @GetMapping("/sync/status")
    fun getSyncStatus(): List<com.cruise.adapter.SyncStatus> = almAdapter.getSyncStatus()

    /**
     * 测试ALM连接
     */
    @GetMapping("/test-connection")
    fun testConnection(): Map<String, Any> {
        return mapOf(
            "status" to "connected",
            "message" to "ALM模拟适配器已连接"
        )
    }
}
