package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "app_user")
class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, unique = true, length = 100)
    val username: String,

    @Column(nullable = false, length = 255)
    val password: String,

    @Column(nullable = false, length = 100)
    val email: String,

    @Column(name = "display_name", length = 100)
    val displayName: String? = null,

    @Column(name = "avatar_url", length = 500)
    val avatarUrl: String? = null,

    @Column(length = 50)
    val role: String = "USER",

    @Column(length = 30)
    val status: String = "ACTIVE",

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA - no-arg constructor
    constructor() : this(
        id = 0,
        username = "",
        password = "",
        email = "",
        displayName = null,
        avatarUrl = null,
        role = "USER",
        status = "ACTIVE",
        createdAt = java.time.LocalDateTime.now(),
        updatedAt = java.time.LocalDateTime.now()
    )
}
