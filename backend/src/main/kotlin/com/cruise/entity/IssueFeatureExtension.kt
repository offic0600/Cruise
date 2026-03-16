package com.cruise.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "issue_feature_extension")
class IssueFeatureExtension(
    @Id
    @Column(name = "issue_id")
    var issueId: Long = 0,

    @Column(name = "requirement_owner_id")
    var requirementOwnerId: Long? = null,

    @Column(name = "product_owner_id")
    var productOwnerId: Long? = null,

    @Column(name = "dev_owner_id")
    var devOwnerId: Long? = null,

    @Column(name = "test_owner_id")
    var testOwnerId: Long? = null,

    @Column(name = "dev_participants_text", length = 1000)
    var devParticipantsText: String? = null,

    @Column(name = "tags_text", length = 1000)
    var tagsText: String? = null,

    @Column(name = "created_by_text", length = 255)
    var createdByText: String? = null
)
