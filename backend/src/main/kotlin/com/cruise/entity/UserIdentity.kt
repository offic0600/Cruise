package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "user_identity",
    uniqueConstraints = [
        UniqueConstraint(name = "uk_user_identity_provider_subject", columnNames = ["provider_key", "subject"])
    ]
)
class UserIdentity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "user_id", nullable = false)
    var userId: Long = 0,

    @Column(name = "provider_key", nullable = false, length = 100)
    var providerKey: String = "",

    @Column(name = "provider_type", nullable = false, length = 50)
    var providerType: String = "",

    @Column(nullable = false, length = 255)
    var subject: String = "",

    @Column(length = 500)
    var issuer: String? = null,

    @Column(length = 255)
    var email: String? = null,

    @Column(name = "email_verified", nullable = false)
    var emailVerified: Boolean = false,

    @Column(name = "preferred_username", length = 255)
    var preferredUsername: String? = null,

    @Column(length = 255)
    var name: String? = null,

    @Column(name = "avatar_url", length = 500)
    var avatarUrl: String? = null,

    @Lob
    @Column(name = "claims_json")
    var claimsJson: String? = null,

    @Lob
    @Column(name = "raw_id_token_claims_json")
    var rawIdTokenClaimsJson: String? = null,

    @Lob
    @Column(name = "raw_userinfo_claims_json")
    var rawUserinfoClaimsJson: String? = null,

    @Column(name = "last_login_at")
    var lastLoginAt: LocalDateTime? = null,

    @Column(name = "linked_at")
    var linkedAt: LocalDateTime? = null,

    @Column(name = "sync_at")
    var syncAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
