package com.cruise.skill

import com.cruise.service.DataCollectionService
import com.cruise.service.LLMService
import org.springframework.beans.factory.annotation.Autowired

/**
 * Skill 基类 - 所有 Skill 的父类
 * 支持基于 LLM 的智能回复
 */
abstract class BaseSkill {

    @Autowired
    lateinit var llmService: LLMService

    @Autowired
    lateinit var dataCollectionService: DataCollectionService

    /**
     * Skill 名称
     */
    abstract fun getName(): String

    /**
     * Skill 描述
     */
    abstract fun getDescription(): String

    /**
     * Skill 分类
     */
    abstract fun getCategory(): String

    /**
     * 意图匹配模式
     */
    abstract fun getIntentPatterns(): List<String>

    /**
     * 执行 Skill
     * 子类可以覆盖此方法实现自定义逻辑
     * 默认使用 LLM 生成回复
     */
    open fun execute(input: String): String {
        return llmService.chat(buildPrompt(input))
    }

    /**
     * 构建发送给 LLM 的提示词
     * 子类可以覆盖此方法自定义提示词
     */
    protected open fun buildPrompt(userInput: String): String {
        return buildString {
            appendLine("你是 ${getName()}，${getDescription()}")
            appendLine()
            appendLine("用户输入: $userInput")
            appendLine()
            appendLine(dataCollectionService.getProjectSummary())
            appendLine()
            appendLine("请基于以上数据，回答用户的问题。")
        }
    }

    /**
     * 使用自定义提示词调用 LLM
     */
    protected fun llm(prompt: String): String {
        return llmService.chat(prompt)
    }
}
