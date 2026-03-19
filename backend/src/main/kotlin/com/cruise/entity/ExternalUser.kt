package com.cruise.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "external_user")
class ExternalUser(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 50)
    var service: String = "",

    @Column(name = "external_id", nullable = false, length = 255)
    var externalId: String = "",

    @Column(length = 255)
    var name: String? = null,

    @Column(name = "avatar_url", length = 1000)
    var avatarUrl: String? = null,

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
