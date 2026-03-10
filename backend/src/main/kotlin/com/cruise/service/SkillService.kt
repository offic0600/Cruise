package com.cruise.service

import com.cruise.entity.SkillDefinition
import com.cruise.repository.SkillDefinitionRepository
import com.cruise.repository.SkillExecutionLogRepository
import com.cruise.skill.BaseSkill
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import jakarta.annotation.PostConstruct

@Service
class SkillService(
    private val skillDefinitionRepository: SkillDefinitionRepository,
    private val skillExecutionLogRepository: SkillExecutionLogRepository,
    private val skills: List<BaseSkill>
) {
    private val logger = LoggerFactory.getLogger(SkillService::class.java)
    private val skillRegistry = mutableMapOf<String, BaseSkill>()

    @PostConstruct
    fun init() {
        // 注册所有 Skill
        skills.forEach { skill ->
            registerSkill(skill)
        }

        // 从数据库加载 Skill 定义
        loadSkillDefinitions()

        logger.info("Registered ${skillRegistry.size} skills")
    }

    private fun registerSkill(skill: BaseSkill) {
        skillRegistry[skill.getName()] = skill

        // 尝试从数据库加载或创建定义
        val existing = skillDefinitionRepository.findByName(skill.getName())
        if (existing == null) {
            val definition = SkillDefinition(
                name = skill.getName(),
                description = skill.getDescription(),
                category = skill.getCategory(),
                intentPatterns = skill.getIntentPatterns().joinToString(","),
                status = "ACTIVE"
            )
            skillDefinitionRepository.save(definition)
            logger.info("Created skill definition: ${skill.getName()}")
        }
    }

    private fun loadSkillDefinitions() {
        // 确保数据库中的 Skill 定义与注册的一致
        skillRegistry.keys.forEach { skillName ->
            if (skillDefinitionRepository.findByName(skillName) == null) {
                val skill = skillRegistry[skillName]
                if (skill != null) {
                    val definition = SkillDefinition(
                        name = skill.getName(),
                        description = skill.getDescription(),
                        category = skill.getCategory(),
                        intentPatterns = skill.getIntentPatterns().joinToString(","),
                        status = "ACTIVE"
                    )
                    skillDefinitionRepository.save(definition)
                }
            }
        }
    }

    fun executeSkill(skillName: String, input: String, sessionId: String): String {
        val skill = skillRegistry[skillName]
            ?: throw IllegalArgumentException("Skill not found: $skillName")

        logger.info("Executing skill: $skillName with input: $input")

        val result = skill.execute(input)

        // 更新执行统计
        val definition = skillDefinitionRepository.findByName(skillName)
        if (definition != null) {
            val updatedDefinition = SkillDefinition(
                id = definition.id,
                name = definition.name,
                description = definition.description,
                category = definition.category,
                intentPatterns = definition.intentPatterns,
                parameters = definition.parameters,
                outputSchema = definition.outputSchema,
                status = definition.status,
                executionCount = definition.executionCount + 1,
                successRate = definition.successRate,
                avgExecutionTimeMs = definition.avgExecutionTimeMs,
                version = definition.version,
                createdAt = definition.createdAt,
                updatedAt = definition.updatedAt
            )
            skillDefinitionRepository.save(updatedDefinition)
        }

        return result
    }

    fun getAllSkills(): List<SkillDefinition> {
        return skillDefinitionRepository.findAll()
    }

    fun getSkillByName(name: String): SkillDefinition? {
        return skillDefinitionRepository.findByName(name)
    }

    fun getSkillAnalytics(name: String): SkillAnalytics {
        val definition = skillDefinitionRepository.findByName(name)
            ?: throw IllegalArgumentException("Skill not found: $name")

        val logs = skillExecutionLogRepository.findBySkillName(name)
        val avgExecutionTime = skillExecutionLogRepository.avgExecutionTimeBySkillName(name) ?: 0.0
        val successCount = skillExecutionLogRepository.successCountBySkillName(name)

        return SkillAnalytics(
            name = name,
            executionCount = definition.executionCount,
            successRate = definition.successRate,
            avgExecutionTimeMs = avgExecutionTime.toLong(),
            totalExecutions = logs.size,
            successCount = successCount.toInt()
        )
    }

    fun getSkillsByCategory(category: String): List<SkillDefinition> {
        return skillDefinitionRepository.findByCategory(category)
    }

    fun getSkillNames(): List<String> {
        return skillRegistry.keys.toList()
    }
}

data class SkillAnalytics(
    val name: String,
    val executionCount: Int,
    val successRate: Float,
    val avgExecutionTimeMs: Long,
    val totalExecutions: Int,
    val successCount: Int
)
