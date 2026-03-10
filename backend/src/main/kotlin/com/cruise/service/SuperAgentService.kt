package com.cruise.service

import com.cruise.entity.AgentSession
import com.cruise.entity.SkillExecutionLog
import com.cruise.repository.AgentSessionRepository
import com.cruise.repository.SkillExecutionLogRepository
import com.fasterxml.jackson.databind.ObjectMapper
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.UUID

@Service
class SuperAgentService(
    private val agentSessionRepository: AgentSessionRepository,
    private val skillExecutionLogRepository: SkillExecutionLogRepository,
    private val skillService: SkillService,
    private val objectMapper: ObjectMapper
) {
    private val logger = LoggerFactory.getLogger(SuperAgentService::class.java)

    fun createSession(userId: Long?, userName: String?): AgentSession {
        val session = AgentSession(
            sessionId = UUID.randomUUID().toString(),
            userId = userId,
            userName = userName,
            status = "ACTIVE"
        )
        return agentSessionRepository.save(session)
    }

    fun processQuery(sessionId: String, query: String): AgentResponse {
        val session = agentSessionRepository.findBySessionId(sessionId)
            ?: throw IllegalArgumentException("Session not found: $sessionId")

        // 意图解析
        val intent = parseIntent(query)
        logger.info("Parsed intent: $intent for query: $query")

        // 更新会话状态
        val updatedSession = AgentSession(
            id = session.id,
            sessionId = session.sessionId,
            userId = session.userId,
            userName = session.userName,
            currentIntent = intent,
            context = session.context,
            status = session.status,
            messageCount = session.messageCount + 1,
            createdAt = session.createdAt,
            updatedAt = LocalDateTime.now(),
            endedAt = session.endedAt
        )
        agentSessionRepository.save(updatedSession)

        // Skill 路由
        val skillName = routeToSkill(intent, query)
        logger.info("Routed to skill: $skillName")

        // Skill 执行
        val startTime = System.currentTimeMillis()
        try {
            val result = skillService.executeSkill(skillName, query, sessionId)
            val executionTime = System.currentTimeMillis() - startTime

            // 记录执行日志
            logExecution(sessionId, skillName, query, result, "SUCCESS", executionTime)

            return AgentResponse(
                sessionId = sessionId,
                intent = intent,
                skillName = skillName,
                message = result,
                status = "SUCCESS"
            )
        } catch (e: Exception) {
            val executionTime = System.currentTimeMillis() - startTime
            logExecution(sessionId, skillName, query, null, "FAILED", executionTime, e.message)
            logger.error("Skill execution failed: ${e.message}")

            return AgentResponse(
                sessionId = sessionId,
                intent = intent,
                skillName = skillName,
                message = "处理您的请求时发生错误: ${e.message}",
                status = "FAILED"
            )
        }
    }

    fun endSession(sessionId: String) {
        val session = agentSessionRepository.findBySessionId(sessionId)
            ?: throw IllegalArgumentException("Session not found: $sessionId")

        val endedSession = AgentSession(
            id = session.id,
            sessionId = session.sessionId,
            userId = session.userId,
            userName = session.userName,
            currentIntent = session.currentIntent,
            context = session.context,
            status = "ENDED",
            messageCount = session.messageCount,
            createdAt = session.createdAt,
            updatedAt = LocalDateTime.now(),
            endedAt = LocalDateTime.now()
        )
        agentSessionRepository.save(endedSession)
    }

    fun getSession(sessionId: String): AgentSession {
        return agentSessionRepository.findBySessionId(sessionId)
            ?: throw IllegalArgumentException("Session not found: $sessionId")
    }

    fun getSessionHistory(sessionId: String): List<SkillExecutionLog> {
        return skillExecutionLogRepository.findBySessionId(sessionId)
    }

    private fun parseIntent(query: String): String {
        val lowerQuery = query.lowercase()

        return when {
            lowerQuery.contains("需求") || lowerQuery.contains("requirement") -> "ANALYZE_REQUIREMENT"
            lowerQuery.contains("任务") || lowerQuery.contains("分配") || lowerQuery.contains("task") -> "ASSIGN_TASK"
            lowerQuery.contains("风险") || lowerQuery.contains("alert") || lowerQuery.contains("risk") -> "RISK_ALERT"
            lowerQuery.contains("进度") || lowerQuery.contains("progress") || lowerQuery.contains("评估") -> "ASSESS_PROGRESS"
            lowerQuery.contains("团队") || lowerQuery.contains("成员") || lowerQuery.contains("人员") || lowerQuery.contains("优化") || lowerQuery.contains("team") -> "OPTIMIZE_TEAM"
            lowerQuery.contains("数据") || lowerQuery.contains("统计") || lowerQuery.contains("data") -> "AGGREGATE_DATA"
            lowerQuery.contains("进化") || lowerQuery.contains("优化建议") || lowerQuery.contains("evolution") -> "EVOLUTION"
            lowerQuery.contains("帮助") || lowerQuery.contains("help") || lowerQuery.contains("?") -> "HELP"
            else -> "GENERAL_QUERY"
        }
    }

    private fun routeToSkill(intent: String, query: String): String {
        return when (intent) {
            "ANALYZE_REQUIREMENT" -> "RequirementAnalysisSkill"
            "ASSIGN_TASK" -> "TaskAssignmentSkill"
            "RISK_ALERT" -> "RiskAlertSkill"
            "ASSESS_PROGRESS" -> "ProgressAssessmentSkill"
            "OPTIMIZE_TEAM" -> "TeamOptimizationSkill"
            "AGGREGATE_DATA" -> "DataAggregationSkill"
            "EVOLUTION" -> "EvolutionSkill"
            "HELP" -> "HelpSkill"
            else -> "GeneralQuerySkill"
        }
    }

    private fun logExecution(
        sessionId: String,
        skillName: String,
        input: String,
        output: String?,
        status: String,
        executionTimeMs: Long,
        errorMessage: String? = null
    ) {
        val log = SkillExecutionLog(
            sessionId = sessionId,
            skillName = skillName,
            inputData = input,
            outputData = output,
            status = status,
            errorMessage = errorMessage,
            executionTimeMs = executionTimeMs
        )
        skillExecutionLogRepository.save(log)
    }
}

data class AgentResponse(
    val sessionId: String,
    val intent: String,
    val skillName: String,
    val message: String,
    val status: String
)
