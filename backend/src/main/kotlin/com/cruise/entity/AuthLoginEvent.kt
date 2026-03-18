package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "auth_login_event")
class AuthLoginEvent(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "provider_key", length = 100)
    var providerKey: String? = null,

    @Column(length = 255)
    var email: String? = null,

    @Column(length = 255)
    var subject: String? = null,

    @Column(name = "organization_id")
    var organizationId: Long? = null,

    @Column(nullable = false)
    var success: Boolean = false,

    @Column(length = 255)
    var reason: String? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
