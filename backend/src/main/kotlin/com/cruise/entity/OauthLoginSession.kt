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

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "consumed_at")
    var consumedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
