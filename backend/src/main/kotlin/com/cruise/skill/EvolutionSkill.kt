package com.cruise.skill

import com.cruise.service.EvolutionService
import org.springframework.stereotype.Component

@Component
class EvolutionSkill(
    private val evolutionService: EvolutionService
) : BaseSkill() {

    override fun getName(): String = "EvolutionSkill"

    override fun getDescription(): String = "持续进化技能，分析系统性能并提供优化建议"

    override fun getCategory(): String = "EVOLUTION"

    override fun getIntentPatterns(): List<String> = listOf(
        "进化",
        "优化建议",
        "系统优化",
        "evolution",
        "optimization"
    )
}
