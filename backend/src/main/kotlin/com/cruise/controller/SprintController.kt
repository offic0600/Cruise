package com.cruise.controller

import com.cruise.service.CreateSprintRequest
import com.cruise.service.SprintDto
import com.cruise.service.SprintQuery
import com.cruise.service.SprintService
import com.cruise.service.UpdateSprintRequest
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
@RequestMapping("/api/sprints")
class SprintController(
    private val sprintService: SprintService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) q: String?
    ): List<SprintDto> = sprintService.findAll(
        SprintQuery(
            teamId = teamId,
            projectId = projectId,
            status = status,
            q = q
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): SprintDto = sprintService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateSprintRequest): ResponseEntity<SprintDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(sprintService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateSprintRequest): SprintDto =
        sprintService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        sprintService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
