package com.cruise.skill

import org.springframework.stereotype.Component

@Component
class HelpSkill : BaseSkill() {

    override fun getName(): String = "HelpSkill"

    override fun getDescription(): String = "帮助技能，提供系统功能说明和操作指引"

    override fun getCategory(): String = "HELPER"

    override fun getIntentPatterns(): List<String> = listOf(
        "帮助",
        "help",
        "说明",
        "指引",
        "?"
    )
}
