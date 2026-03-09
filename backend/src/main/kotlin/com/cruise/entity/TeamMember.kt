package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "team_member")
class TeamMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    val name: String,

    @Column(length = 100)
    val email: String? = null,

    @Column(length = 50)
    val role: String = "DEVELOPER",

    @Column(length = 500)
    val skills: String? = null,

    @Column(name = "team_id")
    val teamId: Long? = null,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        name = "",
        email = null,
        role = "DEVELOPER",
        skills = null,
        teamId = null,
        createdAt = java.time.LocalDateTime.now()
    )
}
