package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "project")
class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 255)
    val name: String,

    @Column(length = 1000)
    val description: String? = null,

    @Column(length = 50)
    val status: String = "ACTIVE",

    @Column(name = "start_date")
    val startDate: java.time.LocalDate? = null,

    @Column(name = "end_date")
    val endDate: java.time.LocalDate? = null,

    @Column(name = "created_at")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        name = "",
        description = null,
        status = "ACTIVE",
        startDate = null,
        endDate = null,
        createdAt = java.time.LocalDateTime.now()
    )
}
