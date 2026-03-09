package com.cruise.service

import com.cruise.entity.Task
import com.cruise.repository.TaskRepository
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.LocalDateTime

data class CreateTaskRequest(
    val title: String,
    val description: String? = null,
    val status: String = "PENDING",
    val requirementId: Long,
    val assigneeId: Long? = null,
    val progress: Int? = 0,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val remainingDays: Float? = null,
    val estimatedHours: Float = 0f
)

data class UpdateTaskRequest(
    val title: String? = null,
    val description: String? = null,
    val status: String? = null,
    val assigneeId: Long? = null,
    val progress: Int? = null,
    val teamId: Long? = null,
    val plannedStartDate: String? = null,
    val plannedEndDate: String? = null,
    val estimatedDays: Float? = null,
    val plannedDays: Float? = null,
    val remainingDays: Float? = null,
    val estimatedHours: Float? = null
)

data class LogHoursRequest(
    val hours: Float
)

@Service
class TaskService(
    private val taskRepository: TaskRepository
) {
    private fun parseDate(dateStr: String?): LocalDate? {
        return dateStr?.let { LocalDate.parse(it) }
    }

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
            progress = request.progress ?: 0,
            teamId = request.teamId,
            plannedStartDate = parseDate(request.plannedStartDate),
            plannedEndDate = parseDate(request.plannedEndDate),
            estimatedDays = request.estimatedDays,
            plannedDays = request.plannedDays,
            remainingDays = request.remainingDays,
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
            progress = request.progress ?: task.progress,
            teamId = request.teamId ?: task.teamId,
            plannedStartDate = parseDate(request.plannedStartDate) ?: task.plannedStartDate,
            plannedEndDate = parseDate(request.plannedEndDate) ?: task.plannedEndDate,
            estimatedDays = request.estimatedDays ?: task.estimatedDays,
            plannedDays = request.plannedDays ?: task.plannedDays,
            remainingDays = request.remainingDays ?: task.remainingDays,
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
            progress = task.progress,
            teamId = task.teamId,
            plannedStartDate = task.plannedStartDate,
            plannedEndDate = task.plannedEndDate,
            estimatedDays = task.estimatedDays,
            plannedDays = task.plannedDays,
            remainingDays = task.remainingDays,
            estimatedHours = task.estimatedHours,
            actualHours = task.actualHours + request.hours,
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
