package com.cruise.entity

import jakarta.persistence.*

@Entity
@Table(name = "project")
class Project(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var description: String? = null,

    @Column(length = 50)
    var status: String = "ACTIVE",

    @Column(name = "start_date")
    var startDate: java.time.LocalDate? = null,

    @Column(name = "end_date")
    var endDate: java.time.LocalDate? = null,

    @Column(name = "created_at")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
