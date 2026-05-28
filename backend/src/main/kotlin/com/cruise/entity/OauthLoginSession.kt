package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "oauth_login_session")
class OauthLoginSession(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, unique = true, length = 255)
    var state: String = "",

    @Column(nullable = false, length = 255)
    var nonce: String = "",

    @Column(name = "provider_key", nullable = false, length = 100)
    var providerKey: String = "",

    @Column(name = "code_verifier", length = 255)
    var codeVerifier: String? = null,

    @Column(name = "redirect_uri", length = 500)
    var redirectUri: String? = null,

    @Column(name = "organization_hint")
    var organizationHint: Long? = null,

    @Column(name = "login_hint", length = 255)
    var loginHint: String? = null,

    @Column(name = "requested_scopes", length = 255)
    var requestedScopes: String? = null,

    @Column(name = "post_login_redirect", length = 500)
    var postLoginRedirect: String? = null,

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "consumed_at")
    var consumedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
