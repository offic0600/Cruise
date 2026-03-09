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
    val id: Long = 0,

    @Column(nullable = false, length = 255)
    val title: String,

    @Column(length = 2000)
    val description: String? = null,

    @Column(length = 50)
    val status: String = "NEW",

    @Column(length = 20)
    val priority: String = "MEDIUM",

    @Column(name = "project_id", nullable = false)
    val projectId: Long,

    // 归属小微
    @Column(name = "team_id")
    val teamId: Long? = null,

    // 计划开始时间
    @Column(name = "planned_start_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val plannedStartDate: LocalDate? = null,

    // 期望交付时间
    @Column(name = "expected_delivery_date")
    @JsonFormat(pattern = "yyyy-MM-dd")
    val expectedDeliveryDate: LocalDate? = null,

    // 需求负责人
    @Column(name = "requirement_owner_id")
    val requirementOwnerId: Long? = null,

    // 产品负责人
    @Column(name = "product_owner_id")
    val productOwnerId: Long? = null,

    // 开发负责人
    @Column(name = "dev_owner_id")
    val devOwnerId: Long? = null,

    // 开发参与人（多个，用逗号分隔）
    @Column(name = "dev_participants", length = 500)
    val devParticipants: String? = null,

    // 测试负责人
    @Column(name = "test_owner_id")
    val testOwnerId: Long? = null,

    // 进度（百分比）
    @Column
    val progress: Int = 0,

    // 需求标签（多个，用逗号分隔）
    @Column(name = "tags", length = 500)
    val tags: String? = null,

    // 需求评估人天
    @Column(name = "estimated_days")
    val estimatedDays: Float? = null,

    // 需求计划人天
    @Column(name = "planned_days")
    val plannedDays: Float? = null,

    // 需求缺口人天
    @Column(name = "gap_days")
    val gapDays: Float? = null,

    // 需求缺口预算
    @Column(name = "gap_budget")
    val gapBudget: Float? = null,

    // 需求交付实际人天
    @Column(name = "actual_days")
    val actualDays: Float? = null,

    // 涉及应用S码
    @Column(name = "application_codes", length = 500)
    val applicationCodes: String? = null,

    // 参与供应商
    @Column(length = 500)
    val vendors: String? = null,

    // 参与供应商人员
    @Column(name = "vendor_staff", length = 500)
    val vendorStaff: String? = null,

    // 需求创建人
    @Column(name = "created_by", length = 100)
    val createdBy: String? = null,

    @Column(name = "created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val createdAt: java.time.LocalDateTime = java.time.LocalDateTime.now(),

    @Column(name = "updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    val updatedAt: java.time.LocalDateTime = java.time.LocalDateTime.now()
) {
    // Required by JPA
    constructor() : this(
        id = 0,
        title = "",
        description = null,
        status = "NEW",
        priority = "MEDIUM",
        projectId = 0,
        createdAt = java.time.LocalDateTime.now(),
        updatedAt = java.time.LocalDateTime.now()
    )
}
