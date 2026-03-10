package com.cruise.skill

import org.springframework.stereotype.Component

/**
 * 图表技能 - 生成各类数据可视化图表
 */
@Component
class ChartSkill : BaseSkill() {

    override fun getName(): String = "ChartSkill"

    override fun getDescription(): String = "数据可视化技能，根据项目数据生成各类图表"

    override fun getCategory(): String = "VISUALIZATION"

    override fun getIntentPatterns(): List<String> = listOf(
        "图表",
        "可视化",
        "统计图",
        "chart",
        "graph",
        "可视化",
        "画图",
        "柱状图",
        "折线图",
        "饼图",
        "占比",
        "趋势"
    )
}
