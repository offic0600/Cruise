package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "organization")
class Organization(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(nullable = false, unique = true, length = 100)
    var slug: String = "",

    @Column(nullable = false, length = 50)
    var status: String = "ACTIVE",

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now()
)
