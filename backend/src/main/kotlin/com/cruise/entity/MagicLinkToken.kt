package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "magic_link_token")
class MagicLinkToken(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var email: String = "",

    @Column(name = "token_hash", nullable = false, unique = true, length = 255)
    var tokenHash: String = "",

    @Column(name = "organization_id")
    var organizationId: Long? = null,

    @Column(name = "expires_at", nullable = false)
    var expiresAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "used_at")
    var usedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
