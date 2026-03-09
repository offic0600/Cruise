package com.cruise.controller

import com.cruise.service.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/requirements")
class RequirementController(
    private val requirementService: RequirementService
) {
    @GetMapping
    fun getAll(): List<RequirementDto> = requirementService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): RequirementDto = requirementService.findById(id)

    @GetMapping("/project/{projectId}")
    fun getByProjectId(@PathVariable projectId: Long): List<RequirementDto> =
        requirementService.findByProjectId(projectId)

    @PostMapping
    fun create(@RequestBody request: CreateRequirementRequest): ResponseEntity<RequirementDto> {
        val requirement = requirementService.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(requirement)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateRequirementRequest
    ): RequirementDto = requirementService.update(id, request)

    @PatchMapping("/{id}/status")
    fun updateStatus(
        @PathVariable id: Long,
        @RequestBody request: StatusTransitionRequest
    ): RequirementDto = requirementService.updateStatus(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        requirementService.delete(id)
        return ResponseEntity.noContent().build()
    }
}