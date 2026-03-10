package com.cruise.skill

import com.cruise.service.DefectService
import com.cruise.service.RequirementService
import com.cruise.service.TaskService
import org.springframework.stereotype.Component
import java.time.LocalDate

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

    override fun execute(input: String): String {
        return try {
            val requirements = requirementService.findAll()
            val tasks = taskService.findAll()
            val defects = defectService.getAll()

            val risks = mutableListOf<RiskItem>()

            // 检查延期风险
            val today = LocalDate.now()
            requirements.filter { it.expectedDeliveryDate != null }.forEach { req ->
                try {
                    val dateStr = req.expectedDeliveryDate
                    if (dateStr != null) {
                        val deliveryDate = LocalDate.parse(dateStr)
                        val daysUntilDelivery = java.time.temporal.ChronoUnit.DAYS.between(today, deliveryDate)
                        val progressRatio = req.progress / 100.0

                        if (daysUntilDelivery > 0 && daysUntilDelivery < 7 && progressRatio < 0.5) {
                            risks.add(
                                RiskItem(
                                    type = "DELAY",
                                    severity = "HIGH",
                                    title = "需求【${req.title}】可能延期",
                                    description = "距离交付还有 ${daysUntilDelivery} 天，但进度仅 ${req.progress}%"
                                )
                            )
                        }
                    }
                } catch (e: Exception) {
                    // 忽略日期解析错误
                }
            }

            // 检查缺陷风险
            val openDefects = defects.filter { it.status != "CLOSED" && it.status != "RESOLVED" }
            if (openDefects.size > 10) {
                risks.add(
                    RiskItem(
                        type = "DEFECT",
                        severity = "MEDIUM",
                        title = "缺陷数量过多",
                        description = "当前有 ${openDefects.size} 个未关闭缺陷，可能影响交付"
                    )
                )
            }

            // 检查任务阻塞
            val blockedTasks = tasks.filter { it.status == "BLOCKED" }
            if (blockedTasks.isNotEmpty()) {
                risks.add(
                    RiskItem(
                        type = "BLOCKED",
                        severity = "MEDIUM",
                        title = "存在阻塞任务",
                        description = "有 ${blockedTasks.size} 个任务被阻塞"
                    )
                )
            }

            buildString {
                appendLine("## 风险预警报告")
                appendLine()
                if (risks.isEmpty()) {
                    appendLine("当前未发现明显风险，项目进展正常。")
                } else {
                    appendLine("发现 ${risks.size} 项风险：")
                    appendLine()
                    risks.forEachIndexed { index, risk ->
                        appendLine("### ${index + 1}. ${risk.title}")
                        appendLine("- 严重程度: ${risk.severity}")
                        appendLine("- 说明: ${risk.description}")
                        appendLine()
                    }
                    appendLine("### 建议")
                    appendLine("- 优先处理高风险项")
                    appendLine("- 每日跟踪风险变化")
                }
            }
        } catch (e: Exception) {
            "风险预警分析失败: ${e.message}"
        }
    }
}

data class RiskItem(
    val type: String,
    val severity: String,
    val title: String,
    val description: String
)
