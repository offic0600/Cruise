package com.cruise.controller

import com.cruise.service.CreateProjectRequest
import com.cruise.service.ProjectDto
import com.cruise.service.ProjectQuery
import com.cruise.service.ProjectService
import com.cruise.service.UpdateProjectRequest
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
@RequestMapping("/api/projects")
class ProjectController(
    private val projectService: ProjectService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) status: String?,
        @RequestParam(required = false) q: String?
    ): List<ProjectDto> = projectService.findAll(
        ProjectQuery(
            organizationId = organizationId,
            teamId = teamId,
            status = status,
            q = q
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): ProjectDto = projectService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateProjectRequest): ResponseEntity<ProjectDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateProjectRequest): ProjectDto =
        projectService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        projectService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
