package com.cruise.controller

import com.cruise.service.CreateWorkflowRequest
import com.cruise.service.UpdateWorkflowRequest
import com.cruise.service.WorkflowDto
import com.cruise.service.WorkflowQuery
import com.cruise.service.WorkflowService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/workflows")
class WorkflowController(
    private val workflowService: WorkflowService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) appliesToType: String?
    ): List<WorkflowDto> = workflowService.findAll(
        WorkflowQuery(
            teamId = teamId,
            appliesToType = appliesToType
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): WorkflowDto = workflowService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateWorkflowRequest): ResponseEntity<WorkflowDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(workflowService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateWorkflowRequest): WorkflowDto =
        workflowService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        workflowService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
