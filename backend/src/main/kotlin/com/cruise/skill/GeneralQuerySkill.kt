package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class GeneralQuerySkill : BaseSkill() {
    override fun getName(): String = "GeneralQuerySkill"

    override fun getDescription(): String = "通用查询技能，处理一般性查询"

    override fun getCategory(): String = "GENERAL"

    override fun getIntentPatterns(): List<String> = listOf(
        "查询",
        "搜索",
        "query",
        "search"
    )

    override fun execute(input: String): String {
        return buildString {
            appendLine("## 通用查询")
            appendLine()
            appendLine("我理解您想查询: \"$input\"")
            appendLine()
            appendLine("抱歉，对于这个查询我需要更多上下文信息。")
            appendLine()
            appendLine("您可以尝试以下方式:")
            appendLine("- 询问具体的需求分析，如：分析当前需求")
            appendLine("- 询问进度评估，如：项目进度如何")
            appendLine("- 询问团队情况，如：查看团队负载")
            appendLine("- 询问风险预警，如：有什么风险")
            appendLine()
            appendLine("或者输入「帮助」查看所有可用功能。")
        }
    }
}
