package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "sprint")
class Sprint(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "team_id", nullable = false)
    var teamId: Long = 1,

    @Column(name = "project_id")
    var projectId: Long? = null,

    @Column(nullable = false, length = 255)
    var name: String = "",

    @Column(length = 1000)
    var goal: String? = null,

    @Column(name = "sequence_number", nullable = false)
    var sequenceNumber: Int = 1,

    @Column(nullable = false, length = 30)
    var status: String = "PLANNED",

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDate = LocalDate.now(),

    @Column(name = "end_date", nullable = false)
    var endDate: LocalDate = LocalDate.now().plusDays(13),

    @Column(name = "created_at")
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)
