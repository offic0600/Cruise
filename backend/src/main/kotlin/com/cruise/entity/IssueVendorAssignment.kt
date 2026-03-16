package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "issue_vendor_assignment")
class IssueVendorAssignment(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long = 0,

    @Column(name = "issue_id", nullable = false)
    var issueId: Long = 0,

    @Column(name = "vendor_name", nullable = false, length = 255)
    var vendorName: String = "",

    @Column(name = "vendor_staff_name", length = 255)
    var vendorStaffName: String? = null,

    @Column(length = 100)
    var role: String? = null
)
