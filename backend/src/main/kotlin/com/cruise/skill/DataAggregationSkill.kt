package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class DataAggregationSkill : BaseSkill() {
    override fun getName(): String = "DataAggregationSkill"
    override fun getDescription(): String = "数据聚合技能，汇总统一工作项、团队和统计信息。"
    override fun getCategory(): String = "ANALYSIS"
    override fun getIntentPatterns(): List<String> = listOf(
        "数据汇总",
        "数据统计",
        "全景视图",
        "data aggregation",
        "data summary"
    )
}
