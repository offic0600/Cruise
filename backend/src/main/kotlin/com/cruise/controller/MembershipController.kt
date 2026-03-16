package com.cruise.controller

import com.cruise.service.CreateMembershipRequest
import com.cruise.service.MembershipDto
import com.cruise.service.MembershipQuery
import com.cruise.service.MembershipService
import com.cruise.service.UpdateMembershipRequest
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
@RequestMapping("/api/memberships")
class MembershipController(
    private val membershipService: MembershipService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) organizationId: Long?,
        @RequestParam(required = false) teamId: Long?,
        @RequestParam(required = false) userId: Long?,
        @RequestParam(required = false) active: Boolean?
    ): List<MembershipDto> = membershipService.findAll(
        MembershipQuery(
            organizationId = organizationId,
            teamId = teamId,
            userId = userId,
            active = active
        )
    )

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): MembershipDto = membershipService.findById(id)

    @PostMapping
    fun create(@RequestBody request: CreateMembershipRequest): ResponseEntity<MembershipDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(membershipService.create(request))

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @RequestBody request: UpdateMembershipRequest): MembershipDto =
        membershipService.update(id, request)

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        membershipService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
