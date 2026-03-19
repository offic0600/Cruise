package com.cruise.controller

import com.cruise.service.CreateOrganizationRequest
import com.cruise.service.CreateOrganizationResponse
import com.cruise.service.OrganizationDto
import com.cruise.service.OrganizationService
import com.cruise.service.SlugAvailabilityDto
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/organizations")
class OrganizationController(
    private val organizationService: OrganizationService
) {
    @GetMapping
    fun getOrganizations(): List<OrganizationDto> =
        organizationService.findVisibleOrganizations(currentUsername())

    @GetMapping("/slug-availability")
    fun checkSlugAvailability(@RequestParam slug: String): SlugAvailabilityDto =
        organizationService.checkSlugAvailability(slug)

    @PostMapping
    fun create(@RequestBody request: CreateOrganizationRequest): ResponseEntity<CreateOrganizationResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(organizationService.create(currentUsername(), request))

    private fun currentUsername(): String =
        SecurityContextHolder.getContext().authentication?.name
            ?: throw IllegalStateException("Missing authenticated user")
}
