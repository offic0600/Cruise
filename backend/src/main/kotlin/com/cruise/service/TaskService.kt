package com.cruise.service

import com.cruise.entity.Task
import com.cruise.repository.TaskRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDateTime

data class CreateTaskRequest(
    val title: String,
    val description: String?,
    val status: String = "PENDING",
    val requirementId: Long,
    val assigneeId: Long?,
    val estimatedHours: Float = 0f
)

data class UpdateTaskRequest(
    val title: String?,
    val description: String?,
    val status: String?,
    val assigneeId: Long?,
    val estimatedHours: Float?
)

data class LogHoursRequest(
    val actualHours: Float
)

@Service
class TaskService(
    private val taskRepository: TaskRepository
) {
    fun findAll(): List<Task> = taskRepository.findAll()

    fun findById(id: Long): Task = taskRepository.findById(id)
        .orElseThrow { ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found") }

    fun findByRequirementId(requirementId: Long): List<Task> =
        taskRepository.findByRequirementId(requirementId)

    fun findByAssigneeId(assigneeId: Long): List<Task> =
        taskRepository.findByAssigneeId(assigneeId)

    fun create(request: CreateTaskRequest): Task {
        val task = Task(
            title = request.title,
            description = request.description,
            status = request.status,
            requirementId = request.requirementId,
            assigneeId = request.assigneeId,
            estimatedHours = request.estimatedHours
        )
        return taskRepository.save(task)
    }

    fun update(id: Long, request: UpdateTaskRequest): Task {
        val task = findById(id)

        val updated = Task(
            id = task.id,
            title = request.title ?: task.title,
            description = request.description ?: task.description,
            status = request.status ?: task.status,
            requirementId = task.requirementId,
            assigneeId = request.assigneeId ?: task.assigneeId,
            estimatedHours = request.estimatedHours ?: task.estimatedHours,
            actualHours = task.actualHours,
            createdAt = task.createdAt,
            updatedAt = LocalDateTime.now()
        )

        return taskRepository.save(updated)
    }

    fun logHours(id: Long, request: LogHoursRequest): Task {
        val task = findById(id)

        val updated = Task(
            id = task.id,
            title = task.title,
            description = task.description,
            status = task.status,
            requirementId = task.requirementId,
            assigneeId = task.assigneeId,
            estimatedHours = task.estimatedHours,
            actualHours = task.actualHours + request.actualHours,
            createdAt = task.createdAt,
            updatedAt = LocalDateTime.now()
        )

        return taskRepository.save(updated)
    }

    fun delete(id: Long) {
        val task = findById(id)
        taskRepository.delete(task)
    }
}