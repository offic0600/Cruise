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
}
