package com.cruise.controller

import com.cruise.service.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/auth-providers")
class AuthProviderAdminController(
    private val authProviderAdminService: AuthProviderAdminService
) {
    @GetMapping
    fun list(
        @RequestParam(required = false) scopeLevel: String?,
        @RequestParam(required = false) organizationId: Long?
    ): ResponseEntity<List<AuthProviderAdminDto>> =
        ResponseEntity.ok(authProviderAdminService.list(scopeLevel, organizationId))

    @PostMapping
    fun create(@RequestBody request: CreateAuthProviderRequest): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.status(HttpStatus.CREATED).body(authProviderAdminService.create(request))

    @GetMapping("/{id}")
    fun get(@PathVariable id: Long): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.ok(authProviderAdminService.get(id))

    @PutMapping("/{id}")
    fun update(
        @PathVariable id: Long,
        @RequestBody request: UpdateAuthProviderRequest
    ): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.ok(authProviderAdminService.update(id, request))

    @PostMapping("/{id}/enable")
    fun enable(@PathVariable id: Long): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.ok(authProviderAdminService.setEnabled(id, true))

    @PostMapping("/{id}/disable")
    fun disable(@PathVariable id: Long): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.ok(authProviderAdminService.setEnabled(id, false))

    @PostMapping("/{id}/set-default")
    fun setDefault(@PathVariable id: Long): ResponseEntity<AuthProviderAdminDto> =
        ResponseEntity.ok(authProviderAdminService.setDefault(id))

    @PostMapping("/{id}/test-connection")
    fun testConnection(
        @PathVariable id: Long,
        @RequestBody(required = false) request: TestAuthProviderRequest?
    ): ResponseEntity<TestAuthProviderResponse> =
        ResponseEntity.ok(authProviderAdminService.testConnection(id, request ?: TestAuthProviderRequest()))

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long): ResponseEntity<Void> {
        authProviderAdminService.delete(id)
        return ResponseEntity.noContent().build()
    }
}
