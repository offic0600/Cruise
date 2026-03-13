package com.cruise.controller

import com.cruise.service.DashboardService
import com.cruise.service.ProjectOverview
import com.cruise.service.TeamLoad
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {

    @GetMapping("/project/{id}")
    fun getProjectOverview(@PathVariable id: Long): ProjectOverview =
        dashboardService.getProjectOverview(id)

    @GetMapping("/team/{id}/load")
    fun getTeamLoad(@PathVariable id: Long): List<TeamLoad> =
        dashboardService.getTeamLoad(id)
}