package com.cruise.controller

import com.cruise.service.CreateTeamRequest
import com.cruise.service.TeamDto
import com.cruise.service.TeamQuery
import com.cruise.service.TeamService
import com.cruise.service.UpdateTeamRequest
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
@RequestMapping("/api/teams")
class TeamController(
    private val teamService: TeamService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) q: String?
    ): List<TeamDto> = teamService.findAll(
        TeamQuery(
            organizationId = organizationId,
            q = q
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): TeamDto = teamService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateTeamRequest): ResponseEntity<TeamDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(teamService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateTeamRequest): TeamDto =
        teamService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        teamService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
