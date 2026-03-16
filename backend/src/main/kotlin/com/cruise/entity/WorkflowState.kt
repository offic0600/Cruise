package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "workflow_state")
class WorkflowState(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "workflow_id", nullable = false)
    var workflowId: Long = 0,

    @Column(name = "state_key", nullable = false, length = 50)
    var key: String = "",

    @Column(nullable = false, length = 100)
    var label: String = "",

    @Column(nullable = false, length = 30)
    var category: String = "ACTIVE",

    @Column(name = "sort_order", nullable = false)
    var sortOrder: Int = 0
)
