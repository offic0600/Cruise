package com.cruise.skill

import com.cruise.service.DefectService
import com.cruise.service.RequirementService
import com.cruise.service.TaskService
import org.springframework.stereotype.Component

@Component
class RiskAlertSkill(
    private val requirementService: RequirementService,
    private val taskService: TaskService,
    private val defectService: DefectService
) : BaseSkill() {

    override fun getName(): String = "RiskAlertSkill"

    override fun getDescription(): String = "风险预警技能，识别项目中的潜在风险并提供预警"

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
