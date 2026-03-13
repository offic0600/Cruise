package com.cruise.controller

import com.cruise.service.AnalyticsService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/analytics")
class AnalyticsController(
    private val analyticsService: AnalyticsService
) {
    // ========== 效率度量 ==========

    @GetMapping("/project/{projectId}/efficiency")
    fun getProjectEfficiency(@PathVariable projectId: Long): Map<String, Any> =
        analyticsService.getProjectEfficiency(projectId)

    @GetMapping("/team/{teamId}/ranking")
    fun getTeamRanking(@PathVariable teamId: Long): List<Map<String, Any>> =
        analyticsService.getTeamRanking(teamId)

    @GetMapping("/member/{memberId}/workload")
    fun getMemberWorkload(@PathVariable memberId: Long): Map<String, Any> =
        analyticsService.getMemberWorkload(memberId)

    @GetMapping("/project/{projectId}/throughput")
    fun getThroughput(@PathVariable projectId: Long): Map<String, Any> =
        analyticsService.getThroughput(projectId)

    // ========== 趋势分析 ==========

    @GetMapping("/project/{projectId}/forecast/requirements")
    fun forecastRequirements(@PathVariable projectId: Long): Map<String, Any> =
        analyticsService.forecastRequirements(projectId)

    @GetMapping("/project/{projectId}/trend/hours")
    fun getHoursTrend(@PathVariable projectId: Long): Map<String, Any> =
        analyticsService.getHoursTrend(projectId)

    @GetMapping("/team/{teamId}/velocity")
    fun getTeamVelocity(@PathVariable teamId: Long): Map<String, Any> =
        analyticsService.getTeamVelocity(teamId)

    // ========== 风险预警 ==========

    @GetMapping("/project/{projectId}/risk")
    fun getProjectRisk(@PathVariable projectId: Long): Map<String, Any> =
        analyticsService.getProjectRisk(projectId)

    @GetMapping("/project/{projectId}/risk/delay")
    fun getDelayRisk(@PathVariable projectId: Long): List<Map<String, Any>> =
        analyticsService.getDelayRisk(projectId)

    @GetMapping("/team/{teamId}/bottleneck")
    fun getBottleneck(@PathVariable teamId: Long): Map<String, Any> =
        analyticsService.getBottleneck(teamId)
}
