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

    @Column(length = 50)
    val role: String = "USER",

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA - no-arg constructor
    constructor() : this(
        id = 0,
        username = "",
        password = "",
        email = "",
        role = "USER",
        createdAt = java.time.LocalDateTime.now()
    )
}
