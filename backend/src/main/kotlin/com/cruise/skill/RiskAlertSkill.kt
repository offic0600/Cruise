package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class RiskAlertSkill : BaseSkill() {
    override fun getName(): String = "RiskAlertSkill"
    override fun getDescription(): String = "风险预警技能，识别统一工作项中的延期、阻塞和质量风险。"
    override fun getCategory(): String = "RISK_MANAGEMENT"
    override fun getIntentPatterns(): List<String> = listOf(
        "风险预警",
        "风险提示",
        "风险评估",
        "risk alert",
        "risk warning"
    )
}

data class RiskItem(
    val type: String,
    val severity: String,
    val title: String,
    val description: String
)
