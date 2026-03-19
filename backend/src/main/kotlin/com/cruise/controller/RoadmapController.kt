package com.cruise.controller

import com.cruise.service.AttachRoadmapProjectRequest
import com.cruise.service.CreateRoadmapRequest
import com.cruise.service.RestPageResponse
import com.cruise.service.RoadmapDto
import com.cruise.service.RoadmapProjectDto
import com.cruise.service.RoadmapQuery
import com.cruise.service.RoadmapService
import com.cruise.service.UpdateRoadmapProjectRequest
import com.cruise.service.UpdateRoadmapRequest
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
@RequestMapping("/api/roadmaps")
class RoadmapController(
    private val roadmapService: RoadmapService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) q: String?,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean,
        @RequestParam(required = false, defaultValue = "0") page: Int,
        @RequestParam(required = false, defaultValue = "50") size: Int
    ): RestPageResponse<RoadmapDto> = roadmapService.findAll(
        RoadmapQuery(
            organizationId = organizationId,
            q = q,
            includeArchived = includeArchived,
            page = page,
            size = size
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): RoadmapDto = roadmapService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateRoadmapRequest): ResponseEntity<RoadmapDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(roadmapService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateRoadmapRequest): RoadmapDto =
        roadmapService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        roadmapService.delete(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{id}/projects")
    fun getProjects(
        @PathVariable id: Long,
        @RequestParam(required = false, defaultValue = "false") includeArchived: Boolean
    ): List<RoadmapProjectDto> = roadmapService.findProjects(id, includeArchived)

    @PostMapping("/{id}/projects")
    fun attachProject(
        @PathVariable id: Long,
        @RequestBody request: AttachRoadmapProjectRequest
    ): ResponseEntity<RoadmapProjectDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(roadmapService.attachProject(id, request))

    @PutMapping("/{id}/projects/{relationId}")
    fun updateProject(
        @PathVariable id: Long,
        @PathVariable relationId: Long,
        @RequestBody request: UpdateRoadmapProjectRequest
    ): RoadmapProjectDto = roadmapService.updateProject(id, relationId, request)

    @DeleteMapping("/{id}/projects/{relationId}")
    fun detachProject(@PathVariable id: Long, @PathVariable relationId: Long): ResponseEntity<Void> {
        roadmapService.detachProject(id, relationId)
        return ResponseEntity.noContent().build()
    }
}
