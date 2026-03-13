package com.cruise.controller

import com.cruise.entity.Task
import com.cruise.service.CreateTaskRequest
import com.cruise.service.LogHoursRequest
import com.cruise.service.TaskService
import com.cruise.service.UpdateTaskRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tasks")
class TaskController(
    private val taskService: TaskService
) {

    @GetMapping
    fun getAll(): List<Task> = taskService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): Task = taskService.findById(id)

    @GetMapping("/requirement/{requirementId}")
    fun getByRequirementId(@PathVariable requirementId: Long): List<Task> =
        taskService.findByRequirementId(requirementId)

    @GetMapping("/assignee/{assigneeId}")
    fun getByAssigneeId(@PathVariable assigneeId: Long): List<Task> =
        taskService.findByAssigneeId(assigneeId)

    @PostMapping
    fun create(@RequestBody request: CreateTaskRequest): ResponseEntity<Task> {
        val task = taskService.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(task)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateTaskRequest
    ): Task = taskService.update(id, request)

    @PatchMapping("/{id}/log-hours")
    fun logHours(
        @PathVariable id: Long,
        @RequestBody request: LogHoursRequest
    ): Task = taskService.logHours(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        taskService.delete(id)
        return ResponseEntity.noContent().build()
    }
}