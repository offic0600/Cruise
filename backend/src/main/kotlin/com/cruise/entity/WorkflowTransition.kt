package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "workflow_transition")
class WorkflowTransition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "workflow_id", nullable = false)
    var workflowId: Long = 0,

    @Column(name = "from_state_key", nullable = false, length = 50)
    var fromStateKey: String = "",

    @Column(name = "to_state_key", nullable = false, length = 50)
    var toStateKey: String = ""
)
