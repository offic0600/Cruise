package com.cruise.controller

import com.cruise.service.*
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthProviderController(
    private val authProviderService: AuthProviderService,
    private val oidcAuthService: OidcAuthService,
    private val magicLinkAuthService: MagicLinkAuthService
) {

    @GetMapping("/providers")
    fun getProviders(): ResponseEntity<AuthProvidersResponse> =
        ResponseEntity.ok(authProviderService.getEnabledProviders())

    @GetMapping("/oauth/{providerKey}/start")
    fun startOauth(
        @PathVariable providerKey: String,
        response: HttpServletResponse
    ) {
        response.sendRedirect(oidcAuthService.createAuthorizationUrl(providerKey))
    }

    @GetMapping("/oauth/{providerKey}/callback")
    fun oauthCallback(
        @PathVariable providerKey: String,
        @RequestParam code: String,
        @RequestParam state: String,
        response: HttpServletResponse
    ) {
        response.sendRedirect(oidcAuthService.handleCallback(providerKey, code, state))
    }

    @PostMapping("/magic-link/send")
    fun sendMagicLink(@RequestBody request: MagicLinkSendRequest): ResponseEntity<MagicLinkSendResponse> =
        ResponseEntity.ok(magicLinkAuthService.sendMagicLink(request))

    @GetMapping("/magic-link/verify")
    fun verifyMagicLink(
        @RequestParam token: String,
        response: HttpServletResponse
    ) {
        response.sendRedirect(magicLinkAuthService.verify(token))
    }

    @PostMapping("/logout")
    fun logout(): ResponseEntity<Map<String, String>> =
        ResponseEntity.ok(mapOf("status" to "logged_out"))

    @GetMapping("/me")
    fun me(): ResponseEntity<AuthUserPayload> {
        val username = SecurityContextHolder.getContext().authentication?.name
            ?: return ResponseEntity.status(401).build()
        return ResponseEntity.ok(magicLinkAuthService.getCurrentUser(username))
    }
}
