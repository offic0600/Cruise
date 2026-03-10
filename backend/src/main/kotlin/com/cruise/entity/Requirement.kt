package com.cruise.entity

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "requirement")
@JsonIgnoreProperties(ignoreUnknown = true)
class Requirement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(nullable = false, length = 255)
    var title: String = "",

    @Column(length = 2000)
    var description: String? = null,

    @Column(length = 50)
    var status: String = "NEW",

    @Column(length = 20)
    var priority: String = "MEDIUM",

    @Column(name = "project_id", nullable = false)
    var projectId: Long = 0,

    @Column(name = "team_id")
    var teamId: Long? = null,

    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var plannedStartDate: LocalDate? = null,

    @Column(name = "expected_delivery_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    var expectedDeliveryDate: LocalDate? = null,

    @Column(name = "requirement_owner_id")
    var requirementOwnerId: Long? = null,

    @Column(name = "product_owner_id")
    var productOwnerId: Long? = null,

    @Column(name = "dev_owner_id")
    var devOwnerId: Long? = null,

    @Column(name = "dev_participants", length = 500)
    var devParticipants: String? = null,

    @Column(name = "test_owner_id")
    var testOwnerId: Long? = null,

    @Column
    var progress: Int = 0,

    @Column(name = "tags", length = 500)
    var tags: String? = null,

    @Column(name = "estimated_days")
    var estimatedDays: Float? = null,

    @Column(name = "planned_days")
    var plannedDays: Float? = null,

    @Column(name = "gap_days")
    var gapDays: Float? = null,

    @Column(name = "gap_budget")
    var gapBudget: Float? = null,

    @Column(name = "actual_days")
    var actualDays: Float? = null,

    @Column(name = "application_codes", length = 500)
    var applicationCodes: String? = null,

    @Column(length = 500)
    var vendors: String? = null,

    @Column(name = "vendor_staff", length = 500)
    var vendorStaff: String? = null,

    @Column(name = "created_by", length = 100)
    var createdBy: String? = null,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    var updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
)
