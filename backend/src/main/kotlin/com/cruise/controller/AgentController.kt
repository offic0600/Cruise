package com.cruise.controller

import com.cruise.entity.UserFeedback
import com.cruise.service.AgentResponse
import com.cruise.service.EvolutionService
import com.cruise.service.SuperAgentService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/agent")
class AgentController(
    private val superAgentService: SuperAgentService,
    private val evolutionService: EvolutionService
) {
    @PostMapping("/session")
    fun createSession(@RequestBody request: CreateSessionRequest): AgentSessionResponse {
        val session = superAgentService.createSession(request.userId, request.userName)
        return AgentSessionResponse(
            sessionId = session.sessionId,
            userId = session.userId,
            userName = session.userName,
            status = session.status
        )
    }

    @PostMapping("/query")
    fun processQuery(@RequestBody request: AgentQueryRequest): AgentResponse {
        return superAgentService.processQuery(request.sessionId, request.query)
    }

    @PostMapping("/session/{sessionId}/end")
    fun endSession(@PathVariable sessionId: String): ResponseEntity<Void> {
        superAgentService.endSession(sessionId)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/session/{sessionId}")
    fun getSession(@PathVariable sessionId: String): AgentSessionResponse {
        val session = superAgentService.getSession(sessionId)
        return AgentSessionResponse(
            sessionId = session.sessionId,
            userId = session.userId,
            userName = session.userName,
            status = session.status
        )
    }

    @GetMapping("/session/{sessionId}/history")
    fun getSessionHistory(@PathVariable sessionId: String): List<ExecutionLogDto> {
        val logs = superAgentService.getSessionHistory(sessionId)
        return logs.map { log ->
            ExecutionLogDto(
                id = log.id,
                skillName = log.skillName,
                inputData = log.inputData,
                outputData = log.outputData,
                status = log.status,
                executionTimeMs = log.executionTimeMs,
                createdAt = log.createdAt.toString()
            )
        }
    }

    @PostMapping("/feedback")
    fun submitFeedback(@RequestBody request: FeedbackRequest): ResponseEntity<UserFeedback> {
        val feedback = evolutionService.submitFeedback(
            sessionId = request.sessionId,
            executionLogId = request.executionLogId,
            skillName = request.skillName,
            userId = request.userId,
            rating = request.rating,
            comment = request.comment,
            isPositive = request.isPositive
        )
        return ResponseEntity.ok(feedback)
    }

    @GetMapping("/optimization")
    fun getOptimization(): List<String> {
        return evolutionService.getOptimizationRecommendations()
    }
}

data class CreateSessionRequest(
    val userId: Long? = null,
    val userName: String? = null
)

data class AgentSessionResponse(
    val sessionId: String,
    val userId: Long?,
    val userName: String?,
    val status: String
)

data class AgentQueryRequest(
    val sessionId: String,
    val query: String
)

data class ExecutionLogDto(
    val id: Long,
    val skillName: String,
    val inputData: String?,
    val outputData: String?,
    val status: String,
    val executionTimeMs: Long,
    val createdAt: String
)

data class FeedbackRequest(
    val sessionId: String? = null,
    val executionLogId: Long? = null,
    val skillName: String? = null,
    val userId: Long? = null,
    val rating: Int,
    val comment: String? = null,
    val isPositive: Boolean = true
)
