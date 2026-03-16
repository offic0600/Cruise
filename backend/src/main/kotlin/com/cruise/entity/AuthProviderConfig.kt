package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "auth_provider_config")
class AuthProviderConfig(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "provider_key", nullable = false, unique = true, length = 100)
    var providerKey: String = "",

    @Column(name = "provider_type", nullable = false, length = 50)
    var providerType: String = "",

    @Column(name = "display_name", nullable = false, length = 120)
    var displayName: String = "",

    @Column(name = "issuer_url", length = 500)
    var issuerUrl: String? = null,

    @Column(name = "client_id", length = 255)
    var clientId: String? = null,

    @Column(name = "client_secret", length = 500)
    var clientSecret: String? = null,

    @Column(name = "authorization_url", length = 500)
    var authorizationUrl: String? = null,

    @Column(name = "token_url", length = 500)
    var tokenUrl: String? = null,

    @Column(name = "userinfo_url", length = 500)
    var userinfoUrl: String? = null,

    @Column(name = "jwks_url", length = 500)
    var jwksUrl: String? = null,

    @Column(length = 255)
    var scopes: String? = null,

    @Column(nullable = false)
    var enabled: Boolean = false,

    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,

    @Column(name = "auto_provision_users", nullable = false)
    var autoProvisionUsers: Boolean = true,

    @Column(name = "allowed_domains", length = 500)
    var allowedDomains: String? = null,

    @Column(name = "organization_id")
    var organizationId: Long? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
