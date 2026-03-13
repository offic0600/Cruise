package com.cruise.service

import com.cruise.entity.AgentSession
import com.cruise.entity.SkillExecutionLog
import com.cruise.repository.AgentSessionRepository
import com.cruise.repository.SkillExecutionLogRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.UUID

@Service
class SuperAgentService(
    private val agentSessionRepository: AgentSessionRepository,
    private val skillExecutionLogRepository: SkillExecutionLogRepository,
    private val llmService: LLMService,
    private val dataCollectionService: DataCollectionService
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

        // 更新会话状态
        val updatedSession = AgentSession(
            id = session.id,
            sessionId = session.sessionId,
            userId = session.userId,
            userName = session.userName,
            currentIntent = "LLM_QUERY",
            context = session.context,
            status = session.status,
            messageCount = session.messageCount + 1,
            createdAt = session.createdAt,
            updatedAt = LocalDateTime.now(),
            endedAt = session.endedAt
        )
        agentSessionRepository.save(updatedSession)

        // 直接调用 LLM 处理所有查询
        val startTime = System.currentTimeMillis()
        try {
            // 构建提示词，包含项目数据
            val prompt = buildPrompt(query)
            val result = llmService.chat(prompt)
            val executionTime = System.currentTimeMillis() - startTime

            // 记录执行日志
            logExecution(sessionId, "LLM Query", query, result, "SUCCESS", executionTime)

            return AgentResponse(
                sessionId = sessionId,
                intent = "LLM_QUERY",
                skillName = "LLM",
                message = result,
                status = "SUCCESS"
            )
        } catch (e: Exception) {
            val executionTime = System.currentTimeMillis() - startTime
            logExecution(sessionId, "LLM Query", query, null, "FAILED", executionTime, e.message)
            logger.error("LLM query failed: ${e.message}")

            return AgentResponse(
                sessionId = sessionId,
                intent = "LLM_QUERY",
                skillName = "LLM",
                message = "处理您的请求时发生错误: ${e.message}",
                status = "FAILED"
            )
        }
    }

    private fun buildPrompt(userQuery: String): String {
        return buildString {
            appendLine("你是 Cruise AI 智能助手，一个专业的软件开发过程管理助手。")
            appendLine("你使用的是 MiniMax M2.5 大模型。")
            appendLine()
            appendLine("请根据以下项目数据回答用户的问题。如果问题不需要数据支持，请直接回答。")
            appendLine()
            appendLine("--- 项目数据 ---")
            appendLine(dataCollectionService.getProjectSummary())
            appendLine()
            appendLine("--- 用户问题 ---")
            appendLine(userQuery)
            appendLine()
            appendLine("请用简洁、专业的中文回答。适当使用 Markdown 格式。")
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
