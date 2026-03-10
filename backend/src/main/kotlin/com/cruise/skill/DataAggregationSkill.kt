package com.cruise.skill

import com.cruise.service.DefectService
import com.cruise.service.RequirementService
import com.cruise.service.TaskService
import com.cruise.service.TeamMemberService
import org.springframework.stereotype.Component

@Component
class DataAggregationSkill(
    private val requirementService: RequirementService,
    private val taskService: TaskService,
    private val teamMemberService: TeamMemberService,
    private val defectService: DefectService
) : BaseSkill() {

    override fun getName(): String = "DataAggregationSkill"

    override fun getDescription(): String = "数据聚合技能，汇总多数据源信息提供全景视图"

    override fun getCategory(): String = "ANALYSIS"

    override fun getIntentPatterns(): List<String> = listOf(
        "数据汇总",
        "数据统计",
        "全景视图",
        "data aggregation",
        "data summary"
    )
}
