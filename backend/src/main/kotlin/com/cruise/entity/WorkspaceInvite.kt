package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "workspace_invite")
class WorkspaceInvite(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "organization_id", nullable = false)
    var organizationId: Long = 0,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "invite_code", nullable = false, unique = true, length = 120)
    var code: String = "",

    @Column(length = 255)
    var email: String? = null,

    @Column(nullable = false, length = 30)
    var role: String = "MEMBER",

    @Column(name = "created_by", nullable = false)
    var createdBy: Long = 0,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "expires_at")
    var expiresAt: LocalDateTime? = null,

    @Column(name = "used_at")
    var usedAt: LocalDateTime? = null
)
