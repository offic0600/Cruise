package com.cruise.controller

import com.cruise.entity.TeamMember
import com.cruise.service.CreateTeamMemberRequest
import com.cruise.service.TeamMemberService
import com.cruise.service.UpdateTeamMemberRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/team-members")
class TeamMemberController(
    private val teamMemberService: TeamMemberService
) {

    @GetMapping
    fun getAll(): List<TeamMember> = teamMemberService.findAll()

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): TeamMember = teamMemberService.findById(id)

    @GetMapping("/team/{teamId}")
    fun getByTeamId(@PathVariable teamId: Long): List<TeamMember> =
        teamMemberService.findByTeamId(teamId)

    @PostMapping
    fun create(@RequestBody request: CreateTeamMemberRequest): ResponseEntity<TeamMember> {
        val member = teamMemberService.create(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(member)
    }

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateTeamMemberRequest
    ): TeamMember = teamMemberService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        teamMemberService.delete(id)
        return ResponseEntity.noContent().build()
    }
}