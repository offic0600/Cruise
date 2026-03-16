package com.cruise.service

import com.cruise.entity.Workflow
import com.cruise.entity.WorkflowState
import com.cruise.entity.WorkflowTransition
import com.cruise.repository.WorkflowRepository
import com.cruise.repository.WorkflowStateRepository
import com.cruise.repository.WorkflowTransitionRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException

data class WorkflowStateDto(
    val id: Long,
    val key: String,
    val label: String,
    val category: String,
    val sortOrder: Int
)

data class WorkflowTransitionDto(
    val id: Long,
    val fromStateKey: String,
    val toStateKey: String
)

data class WorkflowDto(
    val id: Long,
    val teamId: Long,
    val name: String,
    val appliesToType: String,
    val isDefault: Boolean,
    val createdAt: String,
    val states: List<WorkflowStateDto>,
    val transitions: List<WorkflowTransitionDto>
)

data class WorkflowQuery(
    val teamId: Long? = null,
    val appliesToType: String? = null
)

data class WorkflowStateRequest(
    val key: String,
    val label: String,
    val category: String,
    val sortOrder: Int
)

data class WorkflowTransitionRequest(
    val fromStateKey: String,
    val toStateKey: String
)

data class CreateWorkflowRequest(
    val teamId: Long,
    val name: String,
    val appliesToType: String? = null,
    val isDefault: Boolean? = null,
    val states: List<WorkflowStateRequest> = emptyList(),
    val transitions: List<WorkflowTransitionRequest> = emptyList()
)

data class UpdateWorkflowRequest(
    val name: String? = null,
    val appliesToType: String? = null,
    val isDefault: Boolean? = null,
    val states: List<WorkflowStateRequest>? = null,
    val transitions: List<WorkflowTransitionRequest>? = null
)

@Service
class WorkflowService(
    private val workflowRepository: WorkflowRepository,
    private val workflowStateRepository: WorkflowStateRepository,
    private val workflowTransitionRepository: WorkflowTransitionRepository,
    private val teamService: TeamService
) {
    fun findAll(query: WorkflowQuery = WorkflowQuery()): List<WorkflowDto> =
        workflowRepository.findAll()
            .asSequence()
            .filter { query.teamId == null || it.teamId == query.teamId }
            .filter { query.appliesToType == null || it.appliesToType == query.appliesToType }
            .sortedBy { it.id }
            .map { it.toDto() }
            .toList()

    fun findById(id: Long): WorkflowDto = getWorkflow(id).toDto()

    fun create(request: CreateWorkflowRequest): WorkflowDto {
        teamService.requireTeam(request.teamId)
        val workflow = workflowRepository.save(
            Workflow(
                teamId = request.teamId,
                name = request.name,
                appliesToType = request.appliesToType ?: "ALL",
                isDefault = request.isDefault ?: false
            )
        )
        replaceStates(workflow.id, request.states)
        replaceTransitions(workflow.id, request.transitions)
        return getWorkflow(workflow.id).toDto()
    }

    fun update(id: Long, request: UpdateWorkflowRequest): WorkflowDto {
        val workflow = getWorkflow(id)
        workflowRepository.save(
            Workflow(
                id = workflow.id,
                teamId = workflow.teamId,
                name = request.name ?: workflow.name,
                appliesToType = request.appliesToType ?: workflow.appliesToType,
                isDefault = request.isDefault ?: workflow.isDefault,
                createdAt = workflow.createdAt
            )
        )
        request.states?.let { replaceStates(id, it) }
        request.transitions?.let { replaceTransitions(id, it) }
        return getWorkflow(id).toDto()
    }

    fun delete(id: Long) {
        getWorkflow(id)
        workflowStateRepository.deleteAll(workflowStateRepository.findByWorkflowIdOrderBySortOrderAsc(id))
        workflowTransitionRepository.deleteAll(workflowTransitionRepository.findByWorkflowId(id))
        workflowRepository.deleteById(id)
    }

    private fun replaceStates(workflowId: Long, requests: List<WorkflowStateRequest>) {
        workflowStateRepository.deleteAll(workflowStateRepository.findByWorkflowIdOrderBySortOrderAsc(workflowId))
        if (requests.isEmpty()) return
        workflowStateRepository.saveAll(
            requests.map {
                WorkflowState(
                    workflowId = workflowId,
                    key = it.key,
                    label = it.label,
                    category = it.category,
                    sortOrder = it.sortOrder
                )
            }
        )
    }

    private fun replaceTransitions(workflowId: Long, requests: List<WorkflowTransitionRequest>) {
        workflowTransitionRepository.deleteAll(workflowTransitionRepository.findByWorkflowId(workflowId))
        if (requests.isEmpty()) return
        workflowTransitionRepository.saveAll(
            requests.map {
                WorkflowTransition(
                    workflowId = workflowId,
                    fromStateKey = it.fromStateKey,
                    toStateKey = it.toStateKey
                )
            }
        )
    }

    private fun getWorkflow(id: Long): Workflow = workflowRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Workflow not found") }

    private fun Workflow.toDto(): WorkflowDto = WorkflowDto(
        id = id,
        teamId = teamId,
        name = name,
        appliesToType = appliesToType,
        isDefault = isDefault,
        createdAt = createdAt.toString(),
        states = workflowStateRepository.findByWorkflowIdOrderBySortOrderAsc(id).map {
            WorkflowStateDto(
                id = it.id,
                key = it.key,
                label = it.label,
                category = it.category,
                sortOrder = it.sortOrder
            )
        },
        transitions = workflowTransitionRepository.findByWorkflowId(id).map {
            WorkflowTransitionDto(
                id = it.id,
                fromStateKey = it.fromStateKey,
                toStateKey = it.toStateKey
            )
        }
    )
}
