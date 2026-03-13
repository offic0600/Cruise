package com.cruise.service

import com.cruise.controller.AddExternalSkillRequest
import com.cruise.controller.CreateSkillRequest
import com.cruise.controller.UpdateSkillRequest
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

    fun createSkill(request: CreateSkillRequest): SkillDefinition {
        // 检查是否已存在
        if (skillDefinitionRepository.findByName(request.name) != null) {
            throw IllegalArgumentException("Skill already exists: ${request.name}")
        }

        // 检查是否是内置 Skill
        if (skillRegistry.containsKey(request.name)) {
            // 更新内置 Skill 的定义
            val existing = skillDefinitionRepository.findByName(request.name)!!
            val updated = SkillDefinition(
                id = existing.id,
                name = request.name,
                description = request.description,
                category = request.category,
                intentPatterns = request.intentPatterns,
                parameters = request.parameters,
                outputSchema = request.outputSchema,
                status = "ACTIVE",
                executionCount = existing.executionCount,
                successRate = existing.successRate,
                avgExecutionTimeMs = existing.avgExecutionTimeMs,
                version = existing.version,
                createdAt = existing.createdAt,
                updatedAt = java.time.LocalDateTime.now()
            )
            return skillDefinitionRepository.save(updated)
        }

        // 创建新的自定义 Skill
        val definition = SkillDefinition(
            name = request.name,
            description = request.description,
            category = request.category,
            intentPatterns = request.intentPatterns,
            parameters = request.parameters,
            outputSchema = request.outputSchema,
            status = "ACTIVE"
        )
        return skillDefinitionRepository.save(definition)
    }

    fun updateSkill(name: String, request: UpdateSkillRequest): SkillDefinition {
        val existing = skillDefinitionRepository.findByName(name)
            ?: throw IllegalArgumentException("Skill not found: $name")

        val updated = SkillDefinition(
            id = existing.id,
            name = existing.name,
            description = request.description ?: existing.description,
            category = request.category ?: existing.category,
            intentPatterns = request.intentPatterns ?: existing.intentPatterns,
            parameters = request.parameters ?: existing.parameters,
            outputSchema = request.outputSchema ?: existing.outputSchema,
            status = request.status ?: existing.status,
            executionCount = existing.executionCount,
            successRate = existing.successRate,
            avgExecutionTimeMs = existing.avgExecutionTimeMs,
            version = existing.version,
            createdAt = existing.createdAt,
            updatedAt = java.time.LocalDateTime.now()
        )
        return skillDefinitionRepository.save(updated)
    }

    fun deleteSkill(name: String): Boolean {
        val existing = skillDefinitionRepository.findByName(name)
            ?: throw IllegalArgumentException("Skill not found: $name")

        // 如果是内置 Skill，只能标记为删除，不能真正删除
        if (skillRegistry.containsKey(name)) {
            // 标记为 INACTIVE
            val updated = SkillDefinition(
                id = existing.id,
                name = existing.name,
                description = existing.description,
                category = existing.category,
                intentPatterns = existing.intentPatterns,
                parameters = existing.parameters,
                outputSchema = existing.outputSchema,
                status = "INACTIVE",
                executionCount = existing.executionCount,
                successRate = existing.successRate,
                avgExecutionTimeMs = existing.avgExecutionTimeMs,
                version = existing.version,
                createdAt = existing.createdAt,
                updatedAt = java.time.LocalDateTime.now()
            )
            skillDefinitionRepository.save(updated)
            return true
        }

        // 自定义 Skill 可以真正删除
        skillDefinitionRepository.delete(existing)
        return true
    }

    fun addExternalSkill(request: AddExternalSkillRequest): SkillDefinition {
        // 检查是否已存在
        if (skillDefinitionRepository.findByName(request.name) != null) {
            throw IllegalArgumentException("Skill already exists: ${request.name}")
        }

        // 创建外部 Skill 定义
        val definition = SkillDefinition(
            name = request.name,
            description = request.description,
            category = request.category,
            intentPatterns = "", // 外部 Skill 不需要意图模式
            parameters = """{"externalUrl": "${request.externalUrl}", "apiKey": "${request.apiKey ?: ""}"}""",
            status = "EXTERNAL"
        )
        return skillDefinitionRepository.save(definition)
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
