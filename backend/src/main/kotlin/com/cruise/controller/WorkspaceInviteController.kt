package com.cruise.controller

import com.cruise.service.CreateWorkspaceInviteRequest
import com.cruise.service.JoinWorkspaceInviteRequest
import com.cruise.service.JoinWorkspaceInviteResponse
import com.cruise.service.WorkspaceInviteDto
import com.cruise.service.WorkspaceInviteService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api")
class WorkspaceInviteController(
    private val workspaceInviteService: WorkspaceInviteService
) {
    @PostMapping("/organizations/{organizationId}/invites")
    fun createInvite(
        @PathVariable organizationId: Long,
        @RequestBody request: CreateWorkspaceInviteRequest
    ): ResponseEntity<WorkspaceInviteDto> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(workspaceInviteService.createInvite(currentUsername(), organizationId, request))

    @PostMapping("/workspace-invites/join")
    fun joinInvite(@RequestBody request: JoinWorkspaceInviteRequest): JoinWorkspaceInviteResponse =
        workspaceInviteService.joinInvite(currentUsername(), request)

    private fun currentUsername(): String =
        SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalStateException("Missing authenticated user")
}
