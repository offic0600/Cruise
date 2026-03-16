package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate

@Entity
@Table(name = "issue_delivery_plan")
class IssueDeliveryPlan(
    @Id
    @Column(name = "issue_id")
    var issueId: Long = 0,

    @Column(name = "estimated_days")
    var estimatedDays: Float? = null,

    @Column(name = "planned_days")
    var plannedDays: Float? = null,

    @Column(name = "actual_days")
    var actualDays: Float? = null,

    @Column(name = "gap_days")
    var gapDays: Float? = null,

    @Column(name = "gap_budget")
    var gapBudget: Float? = null,

    @Column(name = "expected_delivery_date")
    var expectedDeliveryDate: LocalDate? = null
)
