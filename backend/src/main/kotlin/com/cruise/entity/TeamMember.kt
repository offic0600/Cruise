package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonProperty
import jakarta.persistence.*

@Entity
@Table(name = "team_member")
class TeamMember @JsonCreator constructor(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    var id: Long = 0,

    @Column(nullable = false, length = 100)
    @JsonProperty("name")
    var name: String = "",

    @Column(length = 100)
    @JsonProperty("email")
    var email: String? = null,

    @Column(length = 50)
    @JsonProperty("role")
    var role: String = "DEVELOPER",

    @Column(length = 500)
    @JsonProperty("skills")
    var skills: String? = null,

    @Column(name = "team_id")
    @JsonProperty("teamId")
    var teamId: Long? = null,

    @Column(name = "created_at")
    @JsonProperty("createdAt")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
