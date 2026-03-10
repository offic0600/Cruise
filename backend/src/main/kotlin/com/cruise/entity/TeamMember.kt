package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "team_member")
class TeamMember(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String = "",

    @Column(length = 100)
    var email: String? = null,

    @Column(length = 50)
    var role: String = "DEVELOPER",

    @Column(length = 500)
    var skills: String? = null,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "created_at")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
