package com.cruise.controller

import com.cruise.service.CreateEpicRequest
import com.cruise.service.EpicDto
import com.cruise.service.EpicQuery
import com.cruise.service.EpicService
import com.cruise.service.UpdateEpicRequest
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
@RequestMapping("/api/epics")
class EpicController(
    private val epicService: EpicService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) projectId: Long?,
        @RequestParam(required = false) state: String?,
        @RequestParam(required = false) q: String?
    ): List<EpicDto> = epicService.findAll(
        EpicQuery(
            organizationId = organizationId,
            teamId = teamId,
            projectId = projectId,
            state = state,
            q = q
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): EpicDto = epicService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateEpicRequest): ResponseEntity<EpicDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(epicService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateEpicRequest): EpicDto =
        epicService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        epicService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
